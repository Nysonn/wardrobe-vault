# Wardrobe Vault — Design System

Phase 3 foundation for quiet-luxury UI. Source brief: `docs/initial-prompt.md` §4–§6, §36, §38–§39, §45.

## Palette (`app/globals.css`)

| Token | Role |
|-------|------|
| `--vault-ivory` | Page background |
| `--vault-cream` | Muted surfaces |
| `--vault-charcoal` | Primary text |
| `--vault-espresso` | Primary actions |
| `--vault-taupe` | Secondary text |
| `--vault-stone` | Borders |
| `--vault-accent` | Restrained bronze accent (links, focus) |

Tailwind utilities: `bg-vault-ivory`, `text-vault-charcoal`, etc.

## Typography

| Use | Font | Utility |
|-----|------|---------|
| Headings | Cormorant Garamond | `font-heading`, `text-editorial` |
| UI / body | Source Sans 3 | `font-sans`, `text-ui` |

Configured in `app/layout.tsx`.

## Layout primitives

- `Container` — centered max-width with generous horizontal padding
- `PageShell` — full-height page wrapper (`ivory` or `cream` tone)
- `Section` — vertical rhythm (`compact` / `default` / `generous`)

## Brand components

- `EmptyState` — editorial empty collections (§38 voice)
- `ErrorState` — human-readable errors (§39 voice)
- `VerificationBadge` — subtle typographic badge, not social-media style (§13)

## Animation conventions (§36)

### Do

- `animate-fade-in` / `animate-fade-in-slow` for page sections and empty states
- `transition-vault` (300ms ease-out) on buttons, links, cards
- `hover-lift` for subtle `-translate-y-px` on interactive tiles (sparingly)
- Gentle opacity/transform on modals and image reveals (future)

### Don't

- Bounce, parallax, or spring overshoot
- Loading spinners on every surface
- Pulsing/glowing CTAs
- Motion on large background areas
- Animation for decoration without purpose

## shadcn overrides

Base components restyled in `components/ui/`:

- Smaller radius (`rounded-sm`), no drop shadows on cards
- Espresso primary, stone borders, reduced ring intensity
- Card titles use heading serif at lighter weight

## Anti-AI-design checklist (§45)

Run before marking any page complete:

- [ ] No hero + three glowing gradient cards
- [ ] No purple/blue SaaS gradients or neon accents
- [ ] No excessive rounded corners or glassmorphism
- [ ] Typography uses editorial serif + clean sans hierarchy
- [ ] Whitespace feels intentional, not empty-for-empty's-sake
- [ ] Color comes from photography/listings, not the chrome
- [ ] Empty and error states use brand voice components
- [ ] Dashboard areas (admin/seller) avoid generic metric-card grids
- [ ] Would this pass as a real luxury fashion startup? (§50)

## Phase 3 foundation status

Applied to: home placeholder, auth layout, shared UI primitives. Marketplace and dashboard pages inherit these tokens in Phase 4+.
