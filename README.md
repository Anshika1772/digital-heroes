# Digital Heroes — Golf Performance & Purpose Platform

A modern, editorial golf platform bridging weekend Stableford play with audited charitable impact and monthly luxury golf drawings. Built with **React 18**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **Vercel**.

---

## ⛳ Key Features Implemented

### 1. Editorial Luxury Design Direction
- Warm off-white backgrounds (`bg-[#F9F8F5]`), deep forest-green accents (`#0E231B`, `#153529`), restrained lime highlights (`#AFDE26`), and dark ink typography.
- Serif headings (`Playfair Display`) paired with clean geometric sans (`Plus Jakarta Sans`).
- Refined card styling, subtle micro-interactions, responsive mobile drawer navigation, and celebratory winning animations (`canvas-confetti`).

### 2. High-Converting Landing Experience
- **Editorial Hero Section:** Clear value proposition, live stats counters ($317k+ raised, 4,800+ members, 21k+ rounds), and quick test hub shortcuts.
- **How It Works:** 4-step clear process (1–45 pt Stableford tracking, 50% charity split, draw tickets, tour prize payouts).
- **Vetted Foundations:** Real causes (*First Tee Tomorrow*, *Fairways for Clean Oceans*, *Adaptive Fairways Alliance*, *Honor Caddie Foundation*) with live donation progress and audited field metrics.
- **Prize Tiers & Live Countdown:** Grand Major Tier (Bandon Dunes / Masters VIP), Eagle Tier (Scotty Cameron Tour Prototype), Birdie Tier (Annual Pro V1 ball allocation).
- **Membership Plans:** Monthly ($29/mo) and Yearly ($280/yr - save 20% + 25 bonus entries) with interactive 100% dollar breakdown visualizer.
- **Community Honors Roster:** Live Stableford leaderboard preview and verified draw champion testimonials.

### 3. Member Hub & Stableford Scoring (Strict USGA 1–45 Validation)
- **Profile Card:** Member tier badge, home club, handicap index, and lifetime giving counter.
- **Score Validation:** Strictly enforces 1 to 45 points, unique round date per golfer (no duplicate daily rounds), course name, and 9/18 hole selection.
- **Reverse Chronological Display:** Retains and displays the latest five scores in reverse chronological order with 5-round average and recent high.
- **Edit & Delete:** Full capability to edit and remove previous score entries.
- **Charity Allocation Switcher:** Seamlessly switch your supported foundation anytime.
- **Draw Participation:** Real-time breakdown of base subscription entries + round bonus tickets.
- **Winnings & Winner Proof Upload UI:** Dedicated modal to submit scorecard attestations and signed marker documentation.

### 4. Admin Console & Operations
- **Platform Analytics:** Total funds raised, golfer roster, verified scores, and escrow pool.
- **Winner Verification Queue:** Review submitted scorecards and player attestations; approve or reject proof with audit notes.
- **Payout Management:** Transition payout status from `pending` → `processing` → `paid` with transaction reference numbers.
- **Draw Simulation Engine:** Cryptographically audits entries, runs random ticket drawing with simulated entropy, announces winners, and triggers victory confetti.
- **Roster & Charity Controls:** Promote members to administrators, toggle account status, and onboard new 501(c)(3) charities.

### 5. 1-Click Persona Switcher & Supabase Status
- Evaluators can instantly switch between:
  - **Alex Mercer** (Golfer Member, yearly tier, 5 verified rounds, past draw winner)
  - **Marcus Vance** (Platform Admin with full console access)
  - **Guest** (Logged-out visitor on public landing page)
- Top banner displays live status: `Supabase Ready (Local Simulated Mode)` or `Supabase Connected (Live DB)`.
- Reset button to restore benchmark demo data anytime.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 22+
- npm 9+ or 10+

### Installation & Local Run
```bash
# 1. Install dependencies (already completed)
npm install

# 2. Start local development server
npm run dev

# 3. Build for production (verified clean build)
npm run build

# 4. Preview production build
npm run preview
```

---

## 🗄️ Supabase Backend Integration

A production-ready SQL database schema is included in [`supabase/schema.sql`](file:///c:/Users/anshika%20jaiswal/digital-heroes/supabase/schema.sql).

### Tables & Policies Configured:
- `public.profiles` — Golfer profiles linked with `auth.users`, role enum (`member`, `admin`), handicap index, selected charity.
- `public.charities` — Verified foundations, categories, donation totals, RLS policies for public read and admin write.
- `public.scores` — Stableford scores with `CHECK (stableford_points >= 1 AND stableford_points <= 45)` and unique constraint `(user_id, score_date)`.
- `public.draws` — Major drawings, prize tiers, status tracking.
- `public.draw_entries` — Weighted entry records from subscriptions and score bonuses.
- `public.winners` — Claims, proof URLs, verification status, and payout references.

### Connecting to Live Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run the script in [`supabase/schema.sql`](file:///c:/Users/anshika%20jaiswal/digital-heroes/supabase/schema.sql).
3. Copy your project URL and public `anon` key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. Restart the app (`npm run dev`). The top bar will immediately reflect `⚡ Supabase Connected (Live DB)`.

---

## 🌐 Vercel Deployment

The application is pre-configured for instant zero-configuration deployment to Vercel:
- [`vercel.json`](file:///c:/Users/anshika%20jaiswal/digital-heroes/vercel.json) contains SPA rewrites to ensure clean direct URL routing.
- The build command `npm run build` runs `tsc && vite build` and generates the static assets in `dist/`.

To deploy:
```bash
# Using Vercel CLI:
npx vercel

# Or push to GitHub and connect repository in the Vercel dashboard.
```
