# HealthTrack

A personal weight-monitoring web application built with Next.js 14 App Router, TypeScript, and Supabase.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Database/Auth:** Supabase (Postgres + Row Level Security)
- **Styling:** Tailwind CSS v3 + shadcn/ui
- **Charts:** Recharts
- **State:** TanStack Query v5 + Zustand
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Deployment:** Vercel

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/          # Next.js App Router pages and layouts
  components/   # Shared React components
  lib/          # Utilities, Supabase client, analytics engine
tasks/          # Implementation task tracking (T01-T30)
```

## Tasks

See `/tasks/_index.md` for the full implementation plan across 30 tasks.

## Deployment

### Vercel Setup

1. Import the repository on [vercel.com](https://vercel.com) → New Project → Import Git Repository.
2. Framework preset: **Next.js** (auto-detected).
3. Set environment variables in Project Settings → Environment Variables:

| Variable | Environment | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview | **Never expose to client** |
| `APP_URL` | Production | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Production | `https://your-domain.vercel.app` |

### Supabase Auth for Preview Deploys

In Supabase dashboard → Authentication → URL Configuration:
- **Site URL:** `https://your-domain.vercel.app`
- **Redirect URLs:** Add `https://*.vercel.app/auth/callback`

### Google OAuth redirect URI

In Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs:
```
https://<project-ref>.supabase.co/auth/v1/callback
```
Note: This goes to Supabase, NOT your Vercel domain.
