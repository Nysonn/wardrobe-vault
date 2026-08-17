# CLAUDE.md — Wardrobe Vault

This file orients an AI coding agent (Claude Code or similar) working on this repository. Read this, `AGENTS.md`, `WARDROBE-VAULT-MASTER-PROMPT.md`, and `TECH-SPEC-ADDENDUM.md`, in that order, before making changes.

## What This Project Is

Wardrobe Vault is a premium fashion resale marketplace where fashion pieces previously worn/owned by notable people are bought and sold, held in escrow-style by the platform until sale conditions are met. Full product vision, UX flows, and business rules are in `WARDROBE-VAULT-MASTER-PROMPT.md` — that is the source of truth for *what* to build. This file and `AGENTS.md` govern *how* to build it.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (heavily restyled — see design notes below)
- PostgreSQL + Prisma
- NextAuth.js, database session strategy
- TanStack Query (client reads) + Server Actions (mutations) + Zustand (UI-only state)
- Zod + React Hook Form
- Cloudinary (images/documents)
- Sentry (error monitoring)
- Deployed on Vercel
- Currency: UGX only, integer smallest-unit storage
- Payments: mocked for MVP, behind a swappable `PaymentProvider` interface

Full rationale for each decision is in `TECH-SPEC-ADDENDUM.md`.

## Non-Negotiables (see AGENTS.md for full detail)

- No fake functionality — mocks must behave like the real thing would, just without external calls.
- All money/authorization logic is re-validated server-side, always.
- Every admin action writes an audit log entry.
- No premature "Future Features" (§47 of master prompt) — architect for them, don't build them yet.
- Design must pass the master prompt's §45 "anti-AI-design" test — no generic SaaS/dashboard patterns, no default shadcn look left unstyled.

## Repository Conventions

```
app/
  (marketplace)/         # public browse, item detail, checkout
  (dashboard)/            # logged-in user area: My Vault, Sell, Orders, Wishlist
  admin/                  # admin route group, middleware-protected
lib/
  services/               # business logic per entity (listings, orders, payouts, verification, users)
  schemas/                # shared Zod schemas (client + server)
  auth/                   # session helpers, role guards
  payments/               # PaymentProvider interface + MockPaymentProvider
prisma/
  schema.prisma
  seed.ts
```

- Route handlers and Server Actions stay thin: validate input → call a service function → return result.
- Shared validation schemas are defined once in `lib/schemas/` and imported everywhere they're needed — never redefined client-side vs server-side.

## Build Order

Follow the MVP priority list in master prompt §46. Suggested sequence:

1. Prisma schema (all core tables from §40) + seed script
2. Auth (NextAuth, roles, RBAC guards)
3. Design system foundation (Tailwind config, typography, base shadcn overrides) before building real pages
4. Listing creation → draft → submit flow
5. Admin listing review/approval
6. Public browse/search/item detail pages
7. Checkout → mock payment → order creation
8. Seller wallet/payout view + admin payout approval
9. Wishlist, notifications, messaging
10. Responsive pass + design QA against §45 checklist

## Definition of Done for Any Page/Feature

Before marking a page or flow complete, confirm:
- Server-side validation and authorization are in place, not just client-side.
- If money or status changes are involved, the state transition is valid per the state machine (see tech-spec addendum §3.3) and an audit log entry is written if it's an admin action.
- The UI matches the quiet-luxury design brief — not a generic dashboard/SaaS pattern.
- Empty and error states use the brand voice (master prompt §38–39), not generic technical copy.
