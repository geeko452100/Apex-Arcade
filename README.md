# Apex Arcade

A highly modular, multi-application gaming platform engineered to demonstrate advanced frontend architecture, real-time synchronization, and robust data persistence models. 

Rather than treating games as isolated scripts, Apex Arcade acts as a micro-frontend shell—managing shared layout states, universal navigation context, and encapsulating distinct, complex application engines within a single unified client framework.

## 🛠️ System Architecture & Technology Stack

- **Client Runtime:** React 19 + Vite (Optimized HMR & tree-shaking native build pipeline)
- **Styling Architecture:** Tailwind CSS v4 (Compiling utility design systems natively via Vite compilation)
- **State & Routing:** React Router v6 (Client-side decoupled state synchronization)
- **Backend:** Node.js + Express API (proxies all data/auth operations to Supabase)
- **Database & Auth:** Supabase (PostgreSQL, GoTrue JWT Authentication)

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
cd game-hub
npm install

# Copy env template and fill in Supabase credentials
cp .env.example .env

# Run frontend (Vite) and API server together
npm run dev:all
```

The Vite dev server proxies `/api` requests to the Express backend on port 3001. In production, `npm run build && npm start` serves the built SPA and API from the same process.

### Environment variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `SUPABASE_URL` | Server | Supabase project URL |
| `SUPABASE_ANON_KEY` | Server | Supabase anon key (RLS-scoped user operations) |
| `PORT` | Server | API listen port (default 3001) |
| `VITE_API_URL` | Frontend | API base URL (empty in dev — uses Vite proxy) |
