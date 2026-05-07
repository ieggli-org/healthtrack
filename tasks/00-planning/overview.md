# HealthTrack — Project Overview

Full implementation plan: /Users/leoieggli/.claude/plans/weight-monitoring-app-binary-badger.md

## Tech Stack
- Next.js 14 App Router (single Vercel project)
- TypeScript 5
- Supabase (Auth + Postgres, @supabase/ssr)
- Tailwind CSS v3 + shadcn/ui
- Recharts, TanStack Query v5, Zustand
- Framer Motion, Zod, Papa Parse, date-fns

## Architecture
Single Next.js project. Route Handlers = serverless API. Supabase = auth + DB with RLS.

## Execution waves
See /tasks/_parallel-batches.md
