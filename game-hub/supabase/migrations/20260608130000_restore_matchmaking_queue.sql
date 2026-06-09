-- matchmaking_queue was missing from remote (migration history present, table absent).
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  player_id uuid NOT NULL,
  joined_at timestamptz DEFAULT timezone('utc', now()),
  last_ping timestamptz DEFAULT timezone('utc', now()),
  CONSTRAINT matchmaking_queue_pkey PRIMARY KEY (player_id),
  CONSTRAINT matchmaking_queue_player_id_fkey
    FOREIGN KEY (player_id) REFERENCES auth.users(id)
);

ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own queue status" ON public.matchmaking_queue;

CREATE POLICY "Users manage their own queue status"
  ON public.matchmaking_queue
  AS permissive
  FOR ALL
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

GRANT ALL ON TABLE public.matchmaking_queue TO anon;
GRANT ALL ON TABLE public.matchmaking_queue TO authenticated;
GRANT ALL ON TABLE public.matchmaking_queue TO service_role;
