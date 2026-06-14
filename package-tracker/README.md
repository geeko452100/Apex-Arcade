# Package Tracker (Frontend)

React + Vite client for Package Tracker — a role-based shipment tracking application.

## Setup

```bash
npm install
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
npm run dev
```

## Supabase database

Schema migrations are in `supabase/migrations/`. From this directory:

```bash
npx supabase link --project-ref <your-project-ref>
npm run db:push
```

Tables and RPCs cover user roles, shipping customers, packages, status history, and public tracking lookup.
