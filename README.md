# Gamer Stronghold

A highly modular, multi-application gaming platform engineered to demonstrate advanced frontend architecture, real-time synchronization, and robust data persistence models. 

Rather than treating games as isolated scripts, Gamer Stronghold acts as a micro-frontend shell—managing shared layout states, universal navigation context, and encapsulating distinct, complex application engines within a single unified client framework.

## 🛠️ System Architecture & Technology Stack

- **Client Runtime:** React 19 + Vite (Optimized HMR & tree-shaking native build pipeline)
- **Styling Architecture:** Tailwind CSS v4 (Compiling utility design systems natively via Vite compilation)
- **State & Routing:** React Router v6 (Client-side decoupled state synchronization)
- **Backend:** Supabase (PostgreSQL, Realtime WebSocket Channels, GoTrue JWT Authentication)

## 🏗️ Core Application Roadmap

### 1. Platform Infrastructure & Shell (Current)
- Designed an extensible, low-overhead shell layout with an explicit folder-by-feature architecture.
- Implemented declarative, client-side routing structures ensuring zero-latency transitions and atomic bundle boundaries.

### 2. Micro-App 1: Distributed State Card Battler
- **Technical Target:** Low-latency state synchronization across independent user clients.
- **Implementation Strategy:** Leveraging WebSockets / Supabase Broadcast channels to reconcile concurrent client states.
- **Enterprise Application:** Demonstrates the foundational patterns required for real-time collaboration platforms, live telemetry dashboards, and multi-user transactional software.

### 3. Micro-App 2: Asynchronous Incremental Engine (Idle Clicker)
- **Technical Target:** Designing high-frequency mathematical scaling systems, non-blocking automation loops, and accurate offline data catch-up state calculation.
- **Implementation Strategy:** Utilizing decoupled React state layers driven by optimized delta-time game loops (`requestAnimationFrame`), backed by a PostgreSQL database schema to securely reconcile server timestamps for offline progress calculation.
- **Enterprise Application:** Directly mirrors the core business logic needed for real-time background processing, streaming analytics pipelines, automated billing systems, and compound-interest financial models.

### 4. Micro-App 3: Ephemeral Daily Puzzle Platform
- **Technical Target:** Time-synchronized state invalidation, persistent client caching, and global data rollups.
- **Implementation Strategy:** Integrating server-driven cron tasks to rotate global data pools while tracking local user states using persistent client storage.
- **Enterprise Application:** Demonstrates expertise in automated reporting schedules, distributed data aggregation, and client-side performance caching.

## 🚀 Environment Setup

```bash
# Clone the frontend and install dependencies
cd game-hub
npm install

cp .env.example .env   # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Apply database schema to your Supabase project (first time only)
npx supabase link --project-ref <your-project-ref>
npm run db:push

# Start the dev server
npm run dev
```

Database migrations and server-side RPC functions live in `game-hub/supabase/migrations/`. Apply them with `supabase db push` before running the client.
