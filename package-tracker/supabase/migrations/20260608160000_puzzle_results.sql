-- Daily puzzle results and leaderboard

create table if not exists public.puzzle_results (
  user_id uuid not null references auth.users(id) on delete cascade,
  puzzle_date date not null,
  guesses_used smallint not null check (guesses_used between 1 and 6),
  completed_at timestamptz not null default now(),
  primary key (user_id, puzzle_date)
);

alter table public.puzzle_results enable row level security;

create policy "Anyone authenticated can read puzzle results"
  on public.puzzle_results
  for select
  to authenticated
  using (true);

create policy "Users can insert own puzzle result"
  on public.puzzle_results
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own puzzle result"
  on public.puzzle_results
  for update
  to authenticated
  using (auth.uid() = user_id);

create index if not exists puzzle_results_leaderboard_idx
  on public.puzzle_results (puzzle_date, guesses_used, completed_at);

-- Enable profile name joins for leaderboard display
alter table public.puzzle_results
  add constraint puzzle_results_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

create policy "Authenticated users can read profile names"
  on public.profiles
  for select
  to authenticated
  using (true);
