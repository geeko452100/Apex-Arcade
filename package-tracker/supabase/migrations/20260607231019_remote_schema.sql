


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."find_or_create_match"() RETURNS json
    LANGUAGE "plpgsql"
    AS $$
declare
  waiting_player uuid;
  new_game_id uuid;
begin
  delete from matchmaking_queue 
  where last_ping < now() - interval '15 seconds';

  -- Try to find an active waiting player
  select player_id into waiting_player
  from matchmaking_queue
  where player_id != auth.uid()
  order by joined_at asc
  limit 1
  for update skip locked;

  -- 2. If an opponent was found, create the game
  if waiting_player is not null then
    -- Remove the opponent from the queue
    delete from matchmaking_queue where player_id = waiting_player;
    
    -- Insert the new game (Opponent is player 1, Current user is player 2)
    insert into games (player_1_id, player_2_id, state, turn_owner)
    values (waiting_player, auth.uid(), '{}'::jsonb, 'player-turn')
    returning id into new_game_id;

    return json_build_object('status', 'matched', 'game_id', new_game_id);
  
  -- 3. If no opponent was found, add the current user to the queue
  else
    insert into matchmaking_queue (player_id)
    values (auth.uid())
    on conflict (player_id) do nothing; -- Prevents errors if they click twice

    return json_build_object('status', 'waiting');
  end if;
end;
$$;


ALTER FUNCTION "public"."find_or_create_match"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."matchmaking_queue" (
    "player_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "last_ping" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "status" text NOT NULL DEFAULT 'waiting',
    "match_id" uuid
);


ALTER TABLE "public"."matchmaking_queue" OWNER TO "postgres";


ALTER TABLE ONLY "public"."matchmaking_queue"
    ADD CONSTRAINT "matchmaking_queue_pkey" PRIMARY KEY ("player_id");



ALTER TABLE ONLY "public"."matchmaking_queue"
    ADD CONSTRAINT "matchmaking_queue_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Users manage their own queue status" ON "public"."matchmaking_queue" USING (("auth"."uid"() = "player_id"));



ALTER TABLE "public"."matchmaking_queue" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."find_or_create_match"() TO "anon";
GRANT ALL ON FUNCTION "public"."find_or_create_match"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_or_create_match"() TO "service_role";


















GRANT ALL ON TABLE "public"."matchmaking_queue" TO "anon";
GRANT ALL ON TABLE "public"."matchmaking_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."matchmaking_queue" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


