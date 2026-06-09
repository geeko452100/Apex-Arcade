-- Platform-wide leaderboard: card battler stats + shared read policies

create table if not exists public.card_battler_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  updated_at timestamptz not null default now()
);

alter table public.card_battler_stats enable row level security;

create policy "Authenticated users can read card battler stats"
  on public.card_battler_stats
  for select
  to authenticated
  using (true);

create policy "Users can insert own card battler stats"
  on public.card_battler_stats
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own card battler stats"
  on public.card_battler_stats
  for update
  to authenticated
  using (auth.uid() = user_id);

create index if not exists card_battler_stats_wins_idx
  on public.card_battler_stats (wins desc, losses asc);

-- Atomic win/loss increment (called by the client after a match ends)
create or replace function public.record_card_battler_result(p_won boolean)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.card_battler_stats (user_id, wins, losses)
  values (
    v_user_id,
    case when p_won then 1 else 0 end,
    case when p_won then 0 else 1 end
  )
  on conflict (user_id) do update set
    wins = card_battler_stats.wins + case when p_won then 1 else 0 end,
    losses = card_battler_stats.losses + case when p_won then 0 else 1 end,
    updated_at = now();
end;
$function$;

grant execute on function public.record_card_battler_result(boolean) to authenticated;

-- Enable profile name joins for card battler leaderboard
alter table public.card_battler_stats
  add constraint card_battler_stats_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- Leaderboard needs display names from all players
create policy "Authenticated users can read profiles for leaderboard"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Leaderboard needs idle earnings from all players
create policy "Authenticated users can read idle saves for leaderboard"
  on public.idle_saves
  for select
  to authenticated
  using (true);

-- Enable profile name joins for idle leaderboard
alter table public.idle_saves
  add constraint idle_saves_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
