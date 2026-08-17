# Wardrobe Vault

A premium fashion resale marketplace for pieces previously worn/owned by notable people.

Read `CLAUDE.md`, `AGENTS.md`, and `docs/initial-prompt.md` + `docs/tech-specs.md` before making
changes. Build progress is tracked in `docs/plan.md`.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui, PostgreSQL + Prisma, NextAuth.js,
TanStack Query, Zustand, Zod + React Hook Form, Cloudinary, Sentry. Deployed on Vercel.

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint
- `npx prisma migrate dev` — run migrations
- `npx prisma db seed` — seed the database
