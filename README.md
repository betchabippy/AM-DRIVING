# AMdriving — Road Enthusiast App

A web application for driving enthusiasts to discover, create and join scenic drives together. Built for clubs like AMOC, PCA, Grenadier Club and open to all car lovers.

## Features (MVP)

- **Discover drives** — browse upcoming drives near you, filter by state, club, or character
- **Create a drive** — 4-step flow: type → area → route → invite & publish
- **Drive visibility** — private (invite only), club members, or open to all
- **Open drives** — any member, any car, any club can request a spot
- **RSVP with your car** — select which car you're bringing + add a note
- **My garage** — register your cars, self-declare or verify club membership
- **Club zones** — AMOC, PCA, Grenadier and more — drives, leaderboard, routes, news
- **Leaderboard** — miles driven and drives attended per club chapter

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth |
| Maps | Mapbox GL JS |
| Hosting | Vercel |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/rally-app.git
cd rally-app
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase dashboard, open **SQL Editor**
3. Copy the contents of `supabase/schema.sql` and run it
4. Go to **Project Settings → API** and copy your URL and anon key

### 3. Set up Mapbox

1. Go to [mapbox.com](https://mapbox.com) and create a free account
2. Go to **Account → Tokens** and create a public token
3. Copy the token (starts with `pk.`)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel via GitHub

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Rally MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rally-app.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Select your `rally-app` repository
4. Vercel auto-detects Next.js — no build config needed
5. Under **Environment Variables**, add your three keys from `.env.local`
6. Click **Deploy**

Your app will be live at `https://rally-app.vercel.app` (or your custom domain) in about 60 seconds.

### 3. Automatic deploys

Every push to `main` triggers a new Vercel deployment automatically. No CI/CD setup needed.

---

## Project Structure

```
rally-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home / discover
│   │   ├── drives/
│   │   │   ├── page.tsx        # Drive list
│   │   │   ├── create/         # Create drive flow
│   │   │   └── [id]/           # Drive detail + RSVP
│   │   ├── garage/             # My cars + profile
│   │   ├── clubs/
│   │   │   ├── page.tsx        # Club directory
│   │   │   └── [slug]/         # Club zone (AMOC, PCA etc.)
│   │   └── profile/
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   └── drives/DriveCard.tsx
│   ├── lib/
│   │   ├── mock-data.ts        # Remove when Supabase is connected
│   │   └── supabase.ts
│   └── types/index.ts
├── supabase/
│   └── schema.sql              # Run this in Supabase SQL Editor
└── .env.example
```

---

## Connecting to Real Data

The app currently runs on mock data in `src/lib/mock-data.ts`. To connect to Supabase:

1. Run `supabase/schema.sql` in your Supabase project
2. Replace mock data imports with Supabase queries, e.g.:

```typescript
// Before (mock)
import { mockDrives } from '@/lib/mock-data'

// After (Supabase)
import { supabase } from '@/lib/supabase'
const { data: drives } = await supabase
  .from('drives_with_stats')
  .select('*')
  .gte('drive_date', new Date().toISOString())
  .order('drive_date')
```

---

## Roadmap

**Phase 1 (current)** — Core MVP with mock data  
**Phase 2** — Supabase auth, real drives, club verification  
**Phase 3** — Live route map with Mapbox, equidistant meetpoint algorithm  
**Phase 4** — Convoy / live location sharing during drives  

---

## License

Private — all rights reserved.
