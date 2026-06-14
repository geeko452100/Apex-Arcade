-- Grants, profile backfill, screen-name collisions, idle rank column, matchmaking heartbeat

-- Explicit RPC grants (safe on re-apply)
GRANT EXECUTE ON FUNCTION public.find_or_create_match(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_card_battler_result(boolean) TO authenticated;

-- Backfill profiles for auth users created before the trigger or after a failed insert
INSERT INTO public.profiles (id, email, screen_name)
SELECT
  u.id,
  u.email,
  'Player_' || left(u.id::text, 8)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Avoid signup failures when screen_name is taken or missing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_screen_name text := nullif(trim(NEW.raw_user_meta_data->>'screen_name'), '');
BEGIN
  IF v_screen_name IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE screen_name = v_screen_name
  ) THEN
    v_screen_name := v_screen_name || '_' || left(NEW.id::text, 8);
  END IF;

  IF v_screen_name IS NULL THEN
    v_screen_name := 'Player_' || left(NEW.id::text, 8);
  END IF;

  INSERT INTO public.profiles (id, email, screen_name)
  VALUES (NEW.id, NEW.email, v_screen_name);
  RETURN NEW;
END;
$function$;

-- Denormalised idle earnings for leaderboard queries
ALTER TABLE public.idle_saves
  ADD COLUMN IF NOT EXISTS lifetime_total numeric NOT NULL DEFAULT 0;

UPDATE public.idle_saves
SET lifetime_total =
  coalesce((save_data->>'lifetimeEarnings')::numeric, 0)
  + coalesce((save_data->>'totalEarned')::numeric, 0)
WHERE lifetime_total = 0;

CREATE INDEX IF NOT EXISTS idle_saves_lifetime_total_idx
  ON public.idle_saves (lifetime_total DESC);

-- FK constraints only when missing (avoids failures on re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'card_battler_stats_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.card_battler_stats
      ADD CONSTRAINT card_battler_stats_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'idle_saves_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.idle_saves
      ADD CONSTRAINT idle_saves_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Matchmaking stale cleanup uses heartbeat column
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
  WHERE coalesce(last_ping, joined_at) < now() - interval '60 seconds';

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
    INSERT INTO public.matchmaking_queue (player_id, last_ping)
    VALUES (v_player_id, now())
    ON CONFLICT (player_id) DO UPDATE
      SET last_ping = now(), joined_at = now();

    RETURN QUERY SELECT 'queued'::text, NULL::uuid;
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.find_or_create_match(text) TO authenticated;

-- Screen-name availability check for registration (anon-safe)
CREATE OR REPLACE FUNCTION public.is_screen_name_available(p_screen_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE lower(screen_name) = lower(trim(p_screen_name))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_screen_name_available(text) TO anon;
GRANT EXECUTE ON FUNCTION public.is_screen_name_available(text) TO authenticated;
