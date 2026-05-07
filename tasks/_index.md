# HealthTrack — Task Index

| Task | Title | Status | Phase | Depends on |
|------|-------|--------|-------|------------|
| T01 | Monorepo/Next.js setup | done | 01 | - |
| T02 | Vercel config | todo | 01 | T01 |
| T03 | Supabase setup | todo | 01 | T01 |
| T04 | Design tokens | todo | 01 | T01 |
| T05 | Supabase auth backend | todo | 02 | T01,T03 |
| T06 | Google OAuth config | todo | 02 | T03,T05 |
| T07 | Auth UI | todo | 02 | T04,T05,T06 |
| T08 | DB schema SQL | todo | 03 | T01 |
| T09 | RLS policies | todo | 03 | T08 |
| T10 | Typed Supabase client | todo | 03 | T03,T08,T09 |
| T11 | Entries CRUD API | todo | 04 | T05,T10 |
| T12 | Goals CRUD API | todo | 04 | T05,T10 |
| T13 | Stats endpoint | todo | 04 | T05,T10,T15-T18 |
| T14 | CSV import API | todo | 04 | T05,T10,T11 |
| T15 | Moving averages | todo | 05 | T01 |
| T16 | Projection/regression | todo | 05 | T01,T15 |
| T17 | Plateau detection | todo | 05 | T01 |
| T18 | Streaks/consistency | todo | 05 | T01 |
| T19 | App shell layout | todo | 06 | T04,T07 |
| T20 | Routing/protected routes | todo | 06 | T05,T19 |
| T21 | TanStack Query + hooks | todo | 06 | T01,T11-T13 |
| T22 | Entry log page | todo | 07 | T11,T14,T19-T21 |
| T23 | Dashboard charts | todo | 07 | T13,T19,T21 |
| T24 | Stat cards | todo | 07 | T13,T19,T21 |
| T25 | Goal setup flow | todo | 07 | T12,T13,T16,T19,T21 |
| T26 | Settings page | todo | 07 | T19,T21 |
| T27 | Empty states | todo | 08 | T22-T26 |
| T28 | Mobile refinement | todo | 08 | T22-T26 |
| T29 | Animations | todo | 08 | T23,T24 |
| T30 | Production deploy | todo | 08 | T02,T27-T29 |
