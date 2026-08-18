# AGENTS.md — Wardrobe Vault

Strict operating rules for any AI coding agent working in this repository. These rules override convenience or speed. If a rule and a task conflict, stop and ask rather than silently violating the rule.

## 1. No Fake Functionality
- Never implement a feature that *appears* to work but doesn't (e.g. a "Confirm Payment" button that just sets a flag with no real state machine behind it).
- Where a real integration is out of scope (payments), isolate it behind an interface (`PaymentProvider`) with a clearly named mock implementation (`MockPaymentProvider`). The mock must go through the same status transitions a real provider would. Never let a mock silently short-circuit to "success."
- Never hardcode a value that should come from the database (commission %, currency, category list) just to make a demo work.

## 2. Server Is the Source of Truth
- Every price, total, commission, and payout amount is calculated server-side, on every request. Never trust a number submitted from the client, even one the UI itself just displayed.
- All Zod validation happens server-side (in the Server Action / route handler), regardless of what client-side validation already ran.
- A buyer must never be able to alter an order total. A seller must never be able to mark their own order as paid or their own payout as completed — only the platform (mock provider) or an authorized admin action can do that.

## 3. Authorization
- Every admin route and Server Action must check the session role server-side. Do not rely on hiding a UI element as the only protection — assume a user can hit any URL or call any action directly.
- Role checks live in one shared place (e.g. `lib/auth/guards.ts`), not duplicated ad hoc across files.
- `VERIFIED_PUBLIC_FIGURE` status is never auto-granted. It can only change via an explicit admin action, and that action must be recorded in the audit log.

## 4. Database & Migrations
- Schema changes go through Prisma migrations only. Never hand-edit the database or bypass migration history.
- Don't add tables/columns "just in case." Every field must map to something in the master prompt or tech-spec addendum. If you think something's missing, ask before adding it.
- Money fields are stored as integers (smallest currency unit), never floats.

## 5. Secrets & Config
- Never commit real credentials. `.env.example` lists variable names only, with placeholder values.
- Never log secrets, full card/payment payloads, or full session tokens, even in mock mode.

## 6. Audit Trail
- Every sensitive admin action (listing approve/reject, verification grant/revoke, payout approve, commission change, user suspend) must write an `admin_actions` record: admin, action, target, timestamp, and relevant details. This is not optional and not a "phase 2" item.

## 7. Scope Discipline
- Build only what's in the MVP priority list (master prompt §46) unless explicitly told otherwise. Don't preemptively build auctions, multi-currency, real-time chat, or other "Future Features" (§47) — architect for them, don't implement them.
- If a task seems to require a decision not covered in the master prompt or tech-spec addendum, stop and ask rather than guessing and moving on.

## 8. Code Organization
- Business logic lives in `lib/services/<entity>/`, not inline in route handlers or Server Actions. Actions/routes should be thin — validate input, call a service, return a result.
- Shared Zod schemas live in `lib/schemas/` and are imported by both client forms and server validation — never redefined in two places.
- No commented-out code, no debug `console.log` left in committed code. Use Sentry for error capture, not console logging, outside of local dev.

## 9. Design Fidelity
- The master prompt's design philosophy (§4–§9, §45) is a hard requirement, not a suggestion. Before considering any UI page done, check it against §45's "anti-AI-design" checklist. Generic SaaS-dashboard patterns, gradient hero + three cards, or default shadcn styling left unmodified are rejection criteria.

## 10. When Uncertain
- If a requirement is ambiguous between the master prompt and the tech-spec addendum, the tech-spec addendum wins for technical implementation details; the master prompt wins for product/UX/business rules.
- If truly unresolved, stop and ask. Do not silently pick an interpretation for anything touching money, authorization, or data integrity.

## 11. Plan Progress (`docs/plan.md`)
- `docs/plan.md` is the single build-progress tracker. When you finish work that satisfies a checklist item, tick it (`- [ ]` → `- [x]`) in the same session — do not leave this for later.
- Tick only items that are fully complete per the plan and `CLAUDE.md` definition of done.
- Do not tick partial work, and do not remove or rewrite plan items without explicit instruction.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
