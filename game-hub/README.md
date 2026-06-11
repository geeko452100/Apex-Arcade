# Game Hub (Frontend)

React + Vite client for Gamer Stronghold, backed by Supabase BaaS.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

In the Supabase dashboard, add `http://localhost:5173/reset-password` to Auth redirect URLs.

## Supabase integration

Shared client and auth live in `src/lib/supabase/`:

- `client.js` — Supabase singleton
- `AuthProvider.jsx` — Session + profile provider
- `profilePersistence.js` — Profile updates and avatar uploads (Storage)
- `puzzlePersistence.js` — Server-driven daily puzzle words (RPC)

### Database

Schema migrations are in `supabase/migrations/`. From this directory:

```bash
npm run db:link -- --project-ref <your-project-ref>
npm run db:push
```

Tables and RPCs cover auth profiles, card-battler PvP matchmaking, idle cloud saves, puzzle results, daily puzzles, avatars storage, and leaderboards.

### Edge functions

Deploy all functions:

```bash
npm run functions:deploy
```

Seed upcoming daily puzzle words (optional cron target):

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/seed-daily-puzzle?days=14"
```

### Password reset via Brevo

Password reset emails are sent through Brevo using the `send-auth-email` Supabase Auth hook.

1. In [Brevo](https://www.brevo.com/), create an API key and verify your sender email/domain.
2. Deploy the function and set secrets (see `supabase/functions/.env.example`):

```bash
npm run functions:deploy:email
supabase secrets set BREVO_API_KEY=your-key
supabase secrets set BREVO_SENDER_EMAIL=noreply@yourdomain.com
supabase secrets set BREVO_SENDER_NAME="Gamer Stronghold"
```

3. In **Supabase → Authentication → Hooks**, create a **Send Email** hook:
   - Type: HTTPS
   - URL: `https://<project-ref>.supabase.co/functions/v1/send-auth-email`
   - Generate a secret, then set it: `supabase secrets set SEND_EMAIL_HOOK_SECRET="v1,whsec_..."`

4. Keep `http://localhost:5173/reset-password` (and production URL) in Auth redirect URLs.

The forgot-password page calls `resetPasswordForEmail`; Supabase invokes the hook, and Brevo delivers the reset link.

Optional: set `BREVO_RECOVERY_TEMPLATE_ID` to use a Brevo template with params `CONFIRMATION_URL`, `HEADING`, `BUTTON_LABEL`, `OTP_TOKEN`.
