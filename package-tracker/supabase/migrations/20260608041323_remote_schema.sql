alter table "public"."games" drop column "turn_owner";

alter table "public"."games" alter column "status" set default 'active'::text;

alter table "public"."games" alter column "status" set data type text using "status"::text;

alter table "public"."matchmaking_queue" drop column "match_id";

alter table "public"."matchmaking_queue" drop column "status";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.find_or_create_match(p_game_type text)
 RETURNS TABLE(status text, game_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_player_id UUID := auth.uid();
  v_opponent_id UUID;
  v_new_game_id UUID;
BEGIN
  -- 1. Try to find an opponent
  SELECT player_id INTO v_opponent_id 
  FROM public.matchmaking_queue 
  WHERE player_id != v_player_id 
  LIMIT 1;

  IF v_opponent_id IS NOT NULL THEN
    -- 2. Create the game row
    INSERT INTO public.games (player_1_id, player_2_id)
    VALUES (v_opponent_id, v_player_id)
    RETURNING id INTO v_new_game_id;

    -- 3. Remove them from queue
    DELETE FROM public.matchmaking_queue WHERE player_id = v_opponent_id;
    
    RETURN QUERY SELECT 'matched'::TEXT, v_new_game_id;
  ELSE
    -- 4. Add yourself to queue
    INSERT INTO public.matchmaking_queue (player_id) VALUES (v_player_id);
    RETURN QUERY SELECT 'queued'::TEXT, NULL::UUID;
  END IF;
END;
$function$
;


