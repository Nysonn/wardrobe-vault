# Wardrobe Vault — Tech Spec Addendum

This document supplements `WARDROBE-VAULT-MASTER-PROMPT.md`. The master prompt defines product/UX/business rules; this file locks in the technical decisions needed before a coding agent starts scaffolding. Read both before writing code.

---

## 1. Confirmed Stack

| Layer | Decision |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS + shadcn/ui as component base, heavily restyled for the editorial/quiet-luxury brief in the master prompt — do not ship default shadcn look |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (Auth.js) — **database session strategy** (not JWT), using the Prisma adapter, so admin can force-invalidate sessions (e.g. on suspension) |
| Data fetching | Server Components + Server Actions for mutations; TanStack Query for client-side reads that need caching/refetching (dashboards, notifications, messages) |
| Client state | Zustand — UI-only state (modals, filters in-progress, gallery state). Never duplicate server data into Zustand |
| Forms/validation | Zod schemas shared between client (React Hook Form resolver) and server (re-validated in the Server Action — never trust client validation alone) |
| Image/file storage | Cloudinary (user will provide credentials) |
| Payments | **Mocked for MVP.** Must be isolated behind a `PaymentProvider` interface so a real Stripe Connect (or similar) implementation can be dropped in later without touching order/commission logic. Mock must never claim success without going through the same status transitions a real gateway would (pending → confirmed/failed) |
| Error monitoring | Sentry, wired in from the first commit |
| Testing | None required for MVP |
| Hosting | Vercel |
| Currency | UGX only. No decimal subunits in UI (format as whole shillings, e.g. `UGX 2,800,000`). Store amounts as integers (smallest unit) in the DB regardless, so multi-currency/decimal currencies can be added later without a schema change |

---

## 2. Feature-Level Decisions

- **Admin dashboard:** same Next.js app, `/admin` route group, protected by middleware checking role via the session — not a separate app or subdomain.
- **Search:** simple Postgres `ILIKE`/filter queries for MVP. No Algolia/Meilisearch. Architect the query layer (a `searchListings()` service function) so it can be swapped for a dedicated search index later without touching calling code.
- **Messaging:** DB-backed threaded messages, page refresh/polling only. No websockets/Pusher for MVP.
- **Notifications:** in-app only (notifications table + bell icon). No transactional email for MVP.
- **Auth flows:** no email verification, no password reset for MVP. Still hash passwords properly (bcrypt/argon2 via NextAuth credentials provider) — cutting verification/reset is a UX scope cut, not a security one.
- **Pagination:** page-number based (not infinite scroll) on discover/browse.
- **SEO metadata:** skipped for MVP.
- **Seed data:** required — a Prisma seed script producing realistic demo users (regular users, a verified public figure, an admin), listings in various statuses (draft/submitted/approved/rejected/sold), and a few completed orders with full financial breakdowns.

---

## 3. Gaps Not Yet Covered — Recommended Defaults

These weren't asked about explicitly. I'm proposing defaults so the agent isn't blocked; flag any you want changed before build starts.

1. **Image upload constraints (Cloudinary):** cap at 10 images per listing, 10MB per file, JPEG/PNG/WebP only, min resolution ~1200px on the long edge (rejected client-side and re-checked server-side before the Cloudinary upload call completes the listing draft).
2. **RBAC roles (enum):** `USER`, `VERIFIED_PUBLIC_FIGURE`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN` — matches the master prompt's §31. Note `VERIFIED_PUBLIC_FIGURE` is a *flag/status* on a user, not a separate auth role with different permissions — a verified public figure has the same marketplace permissions as `USER`, just a badge and stronger profile. Keep that distinction explicit in the schema (`isVerifiedPublicFigure` + `verificationStatus`, separate from `role`).
3. **Order status state machine:** the master prompt lists ~10 order statuses and ~9 listing statuses (§16, §22). These need to be formalized as enums with an explicit allowed-transitions table before the agent writes the order/listing services — otherwise it'll invent its own transitions inconsistently. I'd recommend defining this as a small state-machine config file, not scattered `if` statements.
4. **Rate limiting:** none specified. Recommend basic rate limiting on listing submission, messaging, and auth endpoints (e.g. Upstash Ratelimit or a simple DB-backed counter) to prevent abuse — cheap to add now, painful to retrofit.
5. **Environment variables:** the agent should produce a `.env.example` covering `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`, `SENTRY_DSN`, and a placeholder `MOCK_PAYMENTS=true` flag — never commit real secrets.
6. **Commission calculation:** must be a single server-side pure function (`calculateOrderTotals()`), covered by at least manual test cases even though automated testing is out of scope, since this is the one place a silent bug directly costs money. Every input (price, commission %, shipping) must be re-fetched/re-validated server-side at checkout — never trust a total posted from the client (already required by master prompt §43, restating because it's the highest-risk spot in the app).
7. **File/folder structure convention:** recommend feature-based organization under `app/` (route groups per domain: `(marketplace)`, `(dashboard)`, `admin`) with a `lib/services/` layer per entity (`listings`, `orders`, `payouts`, `verification`) that both Server Actions and route handlers call into — keeps business logic out of the route/action files themselves.

If any of these defaults don't match your intent, tell me and I'll adjust before the agent starts.
