# Architecture & Tech Stack Recommendation — HK Freelance Match MVP

**Author:** pm-hk-freelance-match  
**Date:** 2026-03-20  
**Status:** RECOMMENDATION — pending main agent approval

---

## 1. Recommended Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Mobile:** Next.js PWA + `next/font` for performance; no separate mobile app at MVP
- **i18n:** `next-intl` — Traditional Chinese (zh-HK locale) + English; all UI strings externalized from day 0
- **UI Components:** shadcn/ui (Radix-based, accessible, customizable)
- **State:** React Query (TanStack Query) + Zustand for global state

**Rationale:** HK market is mobile-first web. PWA gives near-native mobile experience without the 2x dev cost of React Native. Next.js SSR = good SEO for job listings. Ship in weeks, not months.

### Backend
- **Runtime:** Next.js API Routes (serverless) for core logic
- **Serverless Functions:** Supabase Edge Functions for payment webhooks + async jobs
- **No separate Node/Django server** — keep it simple for MVP

### Database
- **Primary:** Supabase (PostgreSQL) with Row Level Security (RLS)
- **Real-time:** Supabase Realtime for messaging
- **Storage:** Supabase Storage (for portfolio images/videos)
- **Search:** Supabase Full-Text Search (pg_trgm) for MVP; upgrade to Typesense/Elasticsearch later if needed

### Hosting
- **App:** Vercel (tight Next.js integration, edge network, HK-accessible)
- **DB + Auth + Storage:** Supabase Cloud (or self-hosted later)

### Auth
- **Provider:** Supabase Auth (email/password + Google + WhatsApp OTP)
- **Session:** Supabase's JWT-based sessions, stored in httpOnly cookies
- **Magic link** login for reducing friction on mobile

### Payments (Escrow)
- **Provider:** **Stripe Connect** — explicitly the right choice for HK
  - Supports HKD settlement to HK bank accounts
  - Built-in escrow via **Connect Onboarding** + **Destination Charges** or **Separate Charges & Transfers**
  - Automatic platform commission split (e.g., 10% to platform)
  - Dispute management + Stripe's dispute flow
  - KYC/AML handled via Stripe's verification
- **Note:** HK has no specific marketplace payment license requirement, but get a HK lawyer to review T&Cs before launch

---

## 2. Key Architecture Decisions

### Monolith vs Microservices → **Monolith (MVP)**
- Next.js API routes = single repo, single deployment
- Supabase handles DB, auth, storage, realtime — externalized but integrated
- Split into services ONLY when a clear bottleneck emerges
- microservices are a premature optimization trap at this stage

### Auth Provider
- **Supabase Auth** — native to stack, RLS integration, OTP via WhatsApp (important for HK market)
- Alternative: Clerk — more polished UI, but adds another vendor dependency

### Payment Provider
- **Stripe Connect** — only serious option for HK escrow marketplace
  - Use **Standard Connect** accounts (freelancers onboard as connected Stripe accounts)
  - Hold funds in platform account → release to freelancer on milestone completion
  - DO NOT use direct Transfers for escrow — use manual payout release after employer approval

### Internationalization (Cantonese/English)
- All text stored in `/messages/en.json` and `/messages/zh-HK.json`
- Use `zh-HK` locale (not `zh-CN`) — Cantonese uses Traditional characters
- Backend: UTF-8 everywhere, no locale assumptions
- Dates: use `Intl.DateTimeFormat` with locale
- Currency: HKD via Stripe, format with proper locale

### Search
- MVP: Supabase pg_trgm full-text search (good enough for <50k jobs)
- Later: Typesense (self-hosted or cloud) for fuzzy Cantonese/English search

---

## 3. Estimated Build Time — Tier 1 (Months 1–3)

Assumptions: 1 developer, full-time, no prior codebase.

| Task | Weeks | Notes |
|------|-------|-------|
| **T1-001: User Management** | 1.5 wks | Supabase Auth, dual registration flows (freelancer/employer), email verification, onboarding wizard |
| **T1-002: User Profiles** | 2 wks | Portfolio upload (Supabase Storage), skills(tags), rates, bio, avatar. Portfolio gallery UI |
| **T1-003: Marketplace Core** | 2.5 wks | Job postings CRUD, categories, search + filter, job detail page, apply/hire flow |
| **T1-004: Escrow & Payments** | 2.5 wks | Stripe Connect onboarding, milestone creation, escrow hold, release on approval, refund flow, commission split |
| **T1-005: Messaging + Calendar** | 2 wks | Supabase Realtime chat, read receipts, calendar booking (Google Calendar API + Apple Calendar .ics), availability |
| **T1-006: Admin Dashboard** | 1.5 wks | User management, transaction log, dispute queue, content moderation |
| **i18n + QA** | 1 wk | Full Cantonese/English QA, mobile QA on HK carriers |
| **Buffer** | 1 wk | Unplanned blockers, polish |
| **TOTAL** | **~13 weeks** | |

**Milestone mapping:**
- Month 1 (Wk 1–4): T1-001 + T1-002 (auth + profiles)
- Month 2 (Wk 5–8): T1-003 + T1-005 (marketplace + messaging)
- Month 3 (Wk 9–13): T1-004 (payments) + T1-006 (admin) + buffer

---

## 4. Assumptions

1. **1 developer, not a team** — if 2+ devs, cut times by 30-40%
2. **No existing codebase** — starting from scratch
3. **HK-specific domain** — `.hk` TLD, HK server edge nodes (Vercel edge handles this)
4. **Employer pays first** — escrow model where employer funds milestone, money held until freelancer delivers
5. **No native mobile app at MVP** — PWA is sufficient for HK market (high smartphone penetration, web-first habits for classifieds/marketplaces)
6. **No video interviews at MVP** — just messaging + calendar booking
7. **Stripe is available to the business entity** — HK Stripe accounts require business registration; ensure entity is set up before dev starts on T1-004
8. **Simple dispute resolution** — at MVP, disputes handled manually via admin dashboard, not automated
9. **Limited to HK** — single geography, HKD only, no cross-border at MVP
10. **Search scope** — <10,000 job postings expected in first 3 months; no search engine needed yet

---

## 5. What To Decide Next

Before code starts, need confirmation on:
1. ✅ **Stripe Connect** approved for business entity? (or is entity formation still pending?)
2. ✅ **Domain** — preferred .hk domain registered?
3. ✅ **Branding** — any existing brand assets, or starting from zero?
4. ✅ **i18n priority** — Cantonese-first or English-first UI?
5. ✅ **Freelancer categories** — predefined list or open tags?

---

## 6. Stack Summary (One-Liner)

```
Next.js 14 + TypeScript + Tailwind + shadcn/ui (PWA)
+ Supabase (Auth + Postgres + Storage + Realtime)
+ Stripe Connect (escrow payments)
+ Vercel (hosting)
+ Google Calendar API (booking)
+ next-intl (zh-HK/en i18n)
```
