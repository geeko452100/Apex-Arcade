-- Cloud saves for Tycoon Terminal (idle game)

create table if not exists public.idle_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.idle_saves enable row level security;

create policy "Users can read own idle save"
  on public.idle_saves
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own idle save"
  on public.idle_saves
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own idle save"
  on public.idle_saves
  for update
  using (auth.uid() = user_id);

create index if not exists idle_saves_updated_at_idx
  on public.idle_saves (updated_at desc);
