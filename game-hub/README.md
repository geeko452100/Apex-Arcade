# Game Hub (Frontend)

React + Vite client for Gamer Stronghold.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Supabase database

Schema migrations are in `supabase/migrations/`. From this directory:

```bash
npx supabase link --project-ref <your-project-ref>
npm run db:push
```

Tables and RPCs cover auth profiles, card-battler PvP matchmaking, idle cloud saves, puzzle results, and leaderboards.
