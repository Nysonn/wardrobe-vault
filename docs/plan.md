# Wardrobe Vault — Build Plan

Source of truth: `initial-prompt.md` (product/UX/business rules) + `tech-specs.md` (technical decisions).
Operating rules: `AGENTS.md` (non-negotiable constraints) + `CLAUDE.md` (orientation, build order, repo conventions).

This plan follows the Build Order defined in `CLAUDE.md`, expanded into phases and sub-phases with a
checklist. Check items off (`- [ ]` → `- [x]`) as they are completed — this file is the single
progress tracker for the project, usable by a human or a coding agent.

**Commit convention:** No AI co-author trailers on commits (no `Co-authored-by: Copilot` or similar)
for this project.

---

## Phase 0 — Project Scaffolding

- [x] Initialize Next.js (App Router) + TypeScript project
- [x] Install and configure Tailwind CSS (v4, CSS-based config — palette/typography restyle in Phase 3)
- [x] Install shadcn/ui (base components only — restyling happens in Phase 3)
- [x] Set up ESLint/Prettier config (ESLint from create-next-app verified clean; no separate
      Prettier config added — not part of the existing toolchain, avoids introducing new tooling)
- [x] Initialize Prisma, connect to PostgreSQL — using Neon (managed Postgres) via
      `@prisma/adapter-neon`; `DATABASE_URL` supplied by user directly in local `.env` (never in chat)
- [x] Set up NextAuth.js (Auth.js) with Prisma adapter, database session strategy — adapter/session
      strategy wired in `lib/auth/config.ts`; credentials provider + RBAC guards land in Phase 2
- [x] Add Sentry from the first commit (`@sentry/nextjs` manually configured — the interactive
      `sentry-wizard` requires a TTY/login unavailable in this environment; `instrumentation.ts`,
      `instrumentation-client.ts`, `app/global-error.tsx` wired, no-ops safely without a DSN)
- [x] Create `.env.example` covering: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
      `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SENTRY_DSN`,
      `MOCK_PAYMENTS=true` — placeholder values only, never real secrets
- [x] Establish folder structure per `CLAUDE.md`:
  - [x] `app/(marketplace)/`, `app/(dashboard)/`, `app/admin/`
  - [x] `lib/services/`, `lib/schemas/`, `lib/auth/`, `lib/payments/`
  - [x] `prisma/schema.prisma`, `prisma/seed.ts` (seed script itself is written in Phase 1.2)
- [x] Configure Vercel deployment target — Next.js is zero-config on Vercel; no `vercel.json`
      needed unless custom build behavior is required later
- [x] Confirm build/lint/dev scripts run cleanly (`npm run dev`, `npm run lint`, `npm run build`)

**Notes for Phase 1:**
- `DATABASE_URL` must be set in a local `.env` (gitignored) pointing at the user's Neon database
  before running `npx prisma migrate dev`.
- Prisma schema currently only has the Auth.js-required models (`User`, `Account`, `Session`,
  `VerificationToken`). Phase 1 extends `User` with `role`/verification fields and adds all
  remaining domain models.
- Git has not been initialized for this project yet (user preference, revisit later).

---

## Phase 1 — Prisma Schema & Seed (Master Prompt §40)

### 1.1 Schema Design
- [x] Define enums: `Role` (`USER`, `VERIFIED_PUBLIC_FIGURE` is a *status*, not a role —
      roles are `USER`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN` per tech-spec §Gaps.2)
- [x] Define enum: `VerificationStatus` (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REVOKED`)
- [x] Define enum: `ListingStatus` (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`,
      `PUBLISHED`, `SOLD`, `SUSPENDED`, `ARCHIVED`)
- [x] Define enum: `OrderStatus` (`ORDER_PLACED`, `PAYMENT_CONFIRMED`, `AWAITING_SELLER`, `SHIPPED`,
      `IN_TRANSIT`, `DELIVERED`, `COMPLETED`, `DISPUTED`, `CANCELLED`)
- [x] Define enum: `PayoutStatus` (`PENDING`, `APPROVED`, `PROCESSING`, `PAID`, `FAILED`, `ON_HOLD`)
- [x] Define enum: `PaymentStatus` (mirrors mock provider's pending → confirmed/failed transitions)
- [x] Model: `User` (auth fields, role, `isVerifiedPublicFigure`, `verificationStatus` — kept
      explicitly separate per tech-spec §Gaps.2)
- [x] Model: `Profile` (bio, location/region, photo, public-figure profile fields)
- [x] Model: `PublicFigureVerification` (application, evidence, status, admin decision, timestamps)
- [x] Model: `Category` (admin-manageable, seeded with §26 list)
- [x] Model: `Listing` (all §14 fields: basic info, story, authenticity fields, status, timestamps)
- [x] Model: `ListingImage`, `ListingDocument` (Cloudinary refs)
- [x] Model: `ListingStatusHistory` (every status transition, actor, reason/notes)
- [x] Model: `ShippingDetail` (per-listing shipping availability/regions/fee/estimate)
- [x] Model: `Favorite` (wishlist)
- [x] Model: `Order`, `OrderItem` (buyer, seller, item, price, commission, shipping, total,
      payment/fulfillment/payout status, dates, tracking)
- [x] Model: `Payment` (mock provider transaction record, status transitions)
- [x] Model: `Payout` (seller earnings, commission breakdown, status)
- [x] Model: `Wallet`, `Transaction` (seller earnings ledger)
- [x] Model: `CommissionSetting` (default / seller-specific / promotional / category-specific,
      admin-configurable, never hardcoded)
- [x] Model: `Notification`
- [x] Model: `Message` (threaded, DB-backed)
- [x] Model: `Report` (listing reports: counterfeit, false claim, misleading, inappropriate, fraud, other)
- [x] Model: `AdminAction` (audit log: admin, action, target, timestamp, details — required, not optional)
- [x] Add indexes for search/filter fields (category, brand, price, status, verification status)
- [x] Document the **listing status transition table** and **order status transition table** as a
      small state-machine config (e.g. `lib/services/listings/stateMachine.ts`,
      `lib/services/orders/stateMachine.ts`) — not scattered `if` statements (tech-spec §Gaps.3)

### 1.2 Migrations & Seed
- [x] Run first Prisma migration
- [x] Write `prisma/seed.ts`: demo regular users, a verified public figure, an admin/super admin
- [x] Seed listings across statuses: draft / submitted / approved / rejected / sold
- [x] Seed a few completed orders with full financial breakdowns (price, commission, shipping, total)
- [x] Seed default `CommissionSetting`
- [x] Seed `Category` list from §26
- [x] Verify seed runs cleanly against a fresh DB

---

## Phase 2 — Auth & RBAC

- [x] Configure NextAuth credentials provider with bcrypt/argon2 password hashing
- [x] Registration flow (no email verification for MVP, per tech-spec §2)
- [x] Login / logout
- [x] Password reset explicitly **out of scope** for MVP (tech-spec §2) — do not build
- [x] Central role-guard module: `lib/auth/guards.ts` (single shared place for role checks —
      AGENTS.md §3)
- [x] Server-side session/role checks on every admin route and Server Action (never rely on
      hidden UI alone)
- [x] Middleware protecting `/admin` route group by role
- [x] Basic rate limiting on auth endpoints (tech-spec §Gaps.4)
- [x] Manual test: non-admin user cannot access `/admin/*` via direct URL

---

## Phase 3 — Design System Foundation

- [x] Tailwind config: neutral luxury palette (ivory, cream, off-white, charcoal, espresso, taupe,
      stone) + one restrained accent color (§5)
- [x] Typography setup: editorial serif for headings, clean sans-serif for UI (§6)
- [x] Base shadcn/ui overrides — remove default shadcn look, no generic AI-dashboard patterns (§45)
- [x] Layout primitives: generous whitespace, restrained borders, no excessive rounded corners/shadows
- [x] Reusable components: elegant empty-state component (brand voice, §38), error-state component
      (human copy, §39), verification badge (subtle, not social-media style, §13)
- [x] Animation conventions: subtle fade-ins/hover/transitions only (§36) — document do/don't list
- [x] Run design against §45 anti-AI-design checklist before proceeding to real pages

---

## Phase 4 — Listing Creation → Draft → Submit Flow

- [x] Zod schemas in `lib/schemas/listing.ts` (shared client/server, single definition — AGENTS.md §8)
- [x] `lib/services/listings/` business logic (create, update, submit, transition status)
- [x] Listing creation form: basic info, story, authenticity, images (multi-upload)
- [x] Cloudinary upload integration: cap 10 images, 10MB/file, JPEG/PNG/WebP, min ~1200px long edge —
      validated client-side **and** re-validated server-side (tech-spec §Gaps.1)
- [x] Save-as-draft (partial completion allowed, not publicly visible — §15)
- [x] Submit-for-review action (transitions Draft → Submitted per state machine)
- [x] "My Listings" view: Published / Drafts / Under Review / Sold / Rejected (§24)
- [x] Server-side re-validation of all fields on submit (never trust client validation alone)

---

## Phase 5 — Admin Listing Review

- [x] Admin listing queue: pending / submitted / under review
- [x] Listing detail review view: seller, images, price, description, claimed wearer, event,
      verification docs, authenticity evidence, submission date, prior moderation history (§17)
- [x] Admin actions: Approve · Reject (with reason) · Request Changes · Suspend · Archive
- [x] Internal admin notes on listings
- [x] Every action writes `AdminAction` audit log entry (admin, action, target, timestamp, details)
- [x] Rejected listings: user notified with reason, can edit and resubmit
- [x] Enforce listing state machine transitions from Phase 1.1 — reject invalid transitions

---

## Phase 6 — Public Browse / Search / Item Detail Pages

### 6.1 Homepage & Discovery
- [x] Editorial homepage: hero (WARDROBE VAULT / tagline), primary CTA "Explore the Vault",
      secondary CTA "Sell a Piece" (§8)
- [x] Featured Vault sections (Recently Added, Most Coveted, Worn by Icons, etc.) — curated, not
      a dense grid (§9)
- [x] Product/item cards: image, item name, brand, price, seller, verification badge, "Worn By",
      event info — not generic e-commerce cards (§10)

### 6.2 Search & Filtering
- [x] `searchListings()` service using Postgres `ILIKE`/filters, architected to be swappable for a
      dedicated search index later without touching call sites (tech-spec §2)
- [x] Search by item/brand/designer/public figure/category/event/size/price/condition/location (§25)
- [x] Filters: price, category, designer, size, condition, verified public figure, recently added,
      most coveted, available, sold
- [x] Page-number-based pagination (not infinite scroll) (tech-spec §2)

### 6.3 Item Detail Page
- [x] Large image gallery (zoom, full-screen, thumbnails) (§37)
- [x] Full detail fields: designer, condition, size, material, color, year, purchase info, event,
      date worn, times worn, seller info, price (§11)
- [x] Authenticity section: clearly distinguish seller-claimed vs. Wardrobe-Vault-verified (§32)
- [x] "Story" section with "Verified Story" indicator when evidence exists, otherwise clearly
      marked unverified — never falsely claim celebrity ownership (§11)
- [x] "Worn By" block linking to public figure profile when applicable (§12)
- [x] Report-listing action (counterfeit / false claim / misleading / inappropriate / fraud / other) (§33)

### 6.4 Profiles
- [x] User profile pages (photo, name, verified status, bio, region, listed/sold items) (§28)
- [x] Verified public figure profile (stronger editorial treatment) linked from "Worn By" (§12, §13)

---

## Phase 7 — Checkout → Mock Payment → Order Creation

- [ ] `PaymentProvider` interface in `lib/payments/` + `MockPaymentProvider` implementation —
      mock must go through the same pending → confirmed/failed transitions a real gateway would,
      never silently short-circuit to "success" (AGENTS.md §1, master prompt §21)
- [ ] `calculateOrderTotals()` pure function in `lib/services/orders/` — single source of truth for
      price, commission, shipping, total; server-side only (tech-spec §Gaps.6)
- [ ] Manual test cases for `calculateOrderTotals()` covering standard, edge, and promotional
      commission scenarios (tech-spec §Gaps.6)
- [ ] Checkout review screen: item, seller, commission (if shown to buyer per business rules),
      shipping fee, total — all values re-fetched/re-validated server-side (§18, §43)
- [ ] Buyer cannot alter order total under any circumstance (AGENTS.md §2, §49)
- [ ] Order creation: unique order ID, buyer, seller, item, price, commission, shipping, total,
      payment status, fulfillment status, payout status, dates, tracking (§23)
- [ ] Funds recorded as held by platform, not seller, until conditions met (§18)
- [ ] Order status state machine enforced (Order Placed → Payment Confirmed → Awaiting Seller →
      Shipped → In Transit → Delivered → Completed, plus Disputed/Cancelled) (§22)
- [ ] Seller cannot mark own order as paid — only mock payment provider or admin action (§49)

---

## Phase 8 — Seller Wallet / Payout View + Admin Payout Approval

- [ ] Seller wallet page: sale amount, commission, net earnings, payout status per order (§20)
- [ ] `lib/services/payouts/` business logic — payout status transitions only via platform/admin,
      never seller-initiated (AGENTS.md §2, §49)
- [ ] Admin payout queue: pending / approved / processing / paid / failed / on hold
- [ ] Admin approve/process payout action — writes `AdminAction` audit log entry
- [ ] Financial transparency: full breakdown stored per transaction (item price, commission,
      shipping, buyer total, seller earnings, platform revenue) (§43)
- [ ] Admin commission settings UI: default / seller-specific / promotional / category-specific,
      configurable — never hardcoded (§19)
- [ ] Commission changes write `AdminAction` audit log entry

---

## Phase 9 — Wishlist, Notifications, Messaging

- [ ] Wishlist: add/remove/view saved pieces (§27)
- [ ] Notifications table + bell icon UI, in-app only (no email for MVP) (tech-spec §2)
- [ ] Notification triggers: listing approved/rejected/needs changes, item sold, purchase confirmed,
      order shipped/delivered, payout approved/completed, verification approved/rejected (§34)
- [ ] DB-backed threaded messages, page refresh/polling only, no websockets (tech-spec §2)
- [ ] Basic rate limiting on messaging endpoints (tech-spec §Gaps.4)

---

## Phase 10 — Public Figure Verification Workflow

- [ ] Verification application flow: user submits evidence (tech-spec/§13)
- [ ] Admin verification queue: applications + evidence review
- [ ] Admin actions: approve / reject / revoke verification — status never auto-granted
      (AGENTS.md §3, §13)
- [ ] Every verification decision writes `AdminAction` audit log entry
- [ ] Verified badge rendering: subtle, premium, not a large social-media-style badge (§13)

---

## Phase 11 — Admin Dashboard Completion

- [ ] Overview: total users, active listings, pending approvals, total sales, platform revenue,
      pending payouts, orders, disputes (§30)
- [ ] Users section: view/search/suspend, review seller activity
- [ ] Suspension invalidates active sessions (enabled by database session strategy) (tech-spec §1)
- [ ] Categories management (create/edit)
- [ ] Reports/disputes management queue
- [ ] Settings: commission, currency, verification rules, shipping settings
- [ ] Confirm every sensitive admin action across the whole app writes to `AdminAction` (final sweep)

---

## Phase 12 — Responsive Pass + Design QA

- [ ] Intentional (not shrunk) mobile layouts for homepage, browse, item detail, dashboard, checkout,
      admin (§35)
- [ ] Tablet/laptop/desktop breakpoint review
- [ ] Full pass against §45 Anti-AI-Design checklist on every page
- [ ] Full pass against §50 Final Design Test questions
- [ ] Empty-state copy review across all list/collection views (brand voice, §38)
- [ ] Error-state copy review — human, non-technical messages; technical details logged to Sentry
      only (§39)
- [ ] Confirm currency formatting throughout: UGX whole-shilling display, integer storage (tech-spec §1)

---

## Out of Scope for MVP (Do Not Build — Architect For Only)

Per master prompt §47 and AGENTS.md §7: mobile apps, celebrity/fashion-house partnerships,
professional item authentication, escrow, international shipping, multi-currency, auctions,
limited drops, private sales, invitation-only collections, personal stylists,
celebrity-curated collections, digital certificates of ownership, blockchain provenance,
AI-assisted descriptions/image enhancement, virtual try-on, concierge service, real payment
gateway integration (beyond the swappable interface), email verification, password reset,
transactional email, websocket/real-time messaging, dedicated search index (Algolia/Meilisearch),
SEO metadata.
