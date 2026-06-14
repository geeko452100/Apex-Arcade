
  create table "public"."games" (
    "id" uuid not null default gen_random_uuid(),
    "player_1_id" uuid not null,
    "player_2_id" uuid,
    "turn_owner" uuid,
    "status" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."games" enable row level security;

CREATE UNIQUE INDEX games_pkey ON public.games USING btree (id);

alter table "public"."games" add constraint "games_pkey" PRIMARY KEY using index "games_pkey";

alter table "public"."games" add constraint "games_player_1_id_fkey" FOREIGN KEY (player_1_id) REFERENCES auth.users(id) not valid;

alter table "public"."games" validate constraint "games_player_1_id_fkey";

alter table "public"."games" add constraint "games_player_2_id_fkey" FOREIGN KEY (player_2_id) REFERENCES auth.users(id) not valid;

alter table "public"."games" validate constraint "games_player_2_id_fkey";

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

grant delete on table "public"."games" to "anon";

grant insert on table "public"."games" to "anon";

grant references on table "public"."games" to "anon";

grant select on table "public"."games" to "anon";

grant trigger on table "public"."games" to "anon";

grant truncate on table "public"."games" to "anon";

grant update on table "public"."games" to "anon";

grant delete on table "public"."games" to "authenticated";

grant insert on table "public"."games" to "authenticated";

grant references on table "public"."games" to "authenticated";

grant select on table "public"."games" to "authenticated";

grant trigger on table "public"."games" to "authenticated";

grant truncate on table "public"."games" to "authenticated";

grant update on table "public"."games" to "authenticated";

grant delete on table "public"."games" to "service_role";

grant insert on table "public"."games" to "service_role";

grant references on table "public"."games" to "service_role";

grant select on table "public"."games" to "service_role";

grant trigger on table "public"."games" to "service_role";

grant truncate on table "public"."games" to "service_role";

grant update on table "public"."games" to "service_role";


  create policy "Users can view their own games"
  on "public"."games"
  as permissive
  for select
  to public
using (((auth.uid() = player_1_id) OR (auth.uid() = player_2_id)));



