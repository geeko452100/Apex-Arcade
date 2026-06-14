-- Restore multiplayer schema after accidental drift in 20260608041323.
-- Client stores full game state in `status` (jsonb) and tracks turns in `turn_owner`.

ALTER TABLE public.games
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.games
  ALTER COLUMN status TYPE jsonb
  USING CASE
    WHEN status IS NULL OR status = 'active' THEN '{}'::jsonb
    WHEN status ~ '^\s*\{' THEN status::jsonb
    ELSE '{}'::jsonb
  END;

ALTER TABLE public.games
  ALTER COLUMN status SET DEFAULT '{}'::jsonb;

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS turn_owner uuid;

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS state_version integer NOT NULL DEFAULT 0;

-- Players may update games they belong to (move sync).
DROP POLICY IF EXISTS "Players can update their own games" ON public.games;

CREATE POLICY "Players can update their own games"
  ON public.games
  AS permissive
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_1_id OR auth.uid() = player_2_id)
  WITH CHECK (auth.uid() = player_1_id OR auth.uid() = player_2_id);

-- Realtime must include games for postgres_changes subscriptions.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'games'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
  END IF;
END $$;

-- Robust matchmaking: stale cleanup, row locking, idempotent queue insert.
DROP FUNCTION IF EXISTS public.find_or_create_match(text);
DROP FUNCTION IF EXISTS public.find_or_create_match();

CREATE OR REPLACE FUNCTION public.find_or_create_match(p_game_type text)
RETURNS TABLE(status text, game_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_player_id   UUID := auth.uid();
  v_opponent_id UUID;
  v_new_game_id UUID;
BEGIN
  IF v_player_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.matchmaking_queue
  WHERE joined_at < now() - interval '60 seconds';

  SELECT mq.player_id
  INTO v_opponent_id
  FROM public.matchmaking_queue mq
  WHERE mq.player_id <> v_player_id
  ORDER BY mq.joined_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_opponent_id IS NOT NULL THEN
    INSERT INTO public.games (player_1_id, player_2_id, status, turn_owner, state_version)
    VALUES (v_opponent_id, v_player_id, '{}'::jsonb, v_opponent_id, 0)
    RETURNING id INTO v_new_game_id;

    DELETE FROM public.matchmaking_queue
    WHERE player_id IN (v_opponent_id, v_player_id);

    RETURN QUERY SELECT 'matched'::text, v_new_game_id;
  ELSE
    INSERT INTO public.matchmaking_queue (player_id)
    VALUES (v_player_id)
    ON CONFLICT (player_id) DO NOTHING;

    RETURN QUERY SELECT 'queued'::text, NULL::uuid;
  END IF;
END;
$function$;
