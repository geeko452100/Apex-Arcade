# Package Tracker

A role-based shipment tracking application built with React and Supabase. Admins create shipments and assign customers; staff update delivery status; anyone can track a package by ID without logging in.

## Roles

| Role | Capabilities |
|------|-------------|
| **Public** | Track packages by tracking ID at `/track` — no account required |
| **Staff** | View all shipments and update delivery status |
| **Admin** | Add customers, set destination addresses, create shipments with initial status |

Staff and admin accounts are provisioned in Supabase (see setup below). Public self-registration is disabled.

## Technology Stack

- **Frontend:** React 19, Vite 8, React Router 7, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Row Level Security, GoTrue auth)

## Setup

```bash
cd game-hub
npm install

# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

npx supabase link --project-ref <your-project-ref>
npm run db:push

npm run dev
```

### Bootstrap admin account

After creating a user in the Supabase dashboard (Authentication → Users), promote them to admin:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

To create a staff account:

```sql
UPDATE public.profiles SET role = 'staff' WHERE email = 'staff@example.com';
```

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/track` | Public | Enter a tracking ID to look up shipment status |
| `/track/:trackingId` | Public | Direct link to a specific tracking result |
| `/login` | Public | Staff and admin sign-in |
| `/admin` | Admin | Manage customers and create shipments |
| `/staff` | Staff, Admin | Update shipment status |

## Database

Schema and RLS policies live in `game-hub/supabase/migrations/`. The package tracker migration adds:

- `profiles.role` — `user`, `staff`, or `admin`
- `shipping_customers` — recipient records (admin-managed)
- `packages` — shipments with auto-generated tracking IDs
- `package_status_history` — audit trail of status changes
- `track_package()` RPC — public lookup returning city/state only (no full PII)
- `update_package_status()` RPC — staff/admin status updates

Apply migrations with `npm run db:push`.
