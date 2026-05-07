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
