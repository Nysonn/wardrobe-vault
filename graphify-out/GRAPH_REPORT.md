# Graph Report - wardrobe-web-app  (2026-08-17)

## Corpus Check
- 58 files · ~19,734 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 414 nodes · 529 edges · 46 communities (34 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 73 edges
2. `Wardrobe Vault — Master Development Prompt` - 54 edges
3. `compilerOptions` - 16 edges
4. `Wardrobe Vault — Build Plan` - 15 edges
5. `AGENTS.md — Wardrobe Vault` - 12 edges
6. `scripts` - 7 edges
7. `CLAUDE.md — Wardrobe Vault` - 7 edges
8. `tailwind` - 6 edges
9. `aliases` - 6 edges
10. `Button()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DialogContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DialogHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DialogTitle()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts

## Communities (46 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (15): cn(), CardAction(), Checkbox(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton() (+7 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): 13. Verified Public Figures, 15. Draft Listings, 17. Admin Listing Review, 18. Buying Flow, 19. Platform Commission, 1. Project Vision, 20. Payout System, 21. Payment Architecture (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (26): dependencies, @auth/prisma-adapter, @base-ui/react, bcryptjs, class-variance-authority, clsx, @hookform/resolvers, lucide-react (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (21): 1.1 Schema Design, 1.2 Migrations & Seed, 6.1 Homepage & Discovery, 6.2 Search & Filtering, 6.3 Item Detail Page, 6.4 Profiles, Out of Scope for MVP (Do Not Build — Architect For Only), Phase 0 — Project Scaffolding (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (25): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+17 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (6): DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (12): 10. When Uncertain, 11. Plan Progress (`docs/plan.md`), 1. No Fake Functionality, 2. Server Is the Source of Truth, 3. Authorization, 4. Database & Migrations, 5. Secrets & Config, 6. Audit Trail (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (8): Build Order, CLAUDE.md — Wardrobe Vault, code:block1 (app/), Definition of Done for Any Page/Feature, Non-Negotiables (see AGENTS.md for full detail), Repository Conventions, Stack, What This Project Is

### Community 10 - "Community 10"
Cohesion: 0.32
Nodes (7): assertOrderTransition(), assertPaymentTransition(), canTransitionOrder(), canTransitionPayment(), ORDER_STATUS_TRANSITIONS, PAYMENT_STATUS_TRANSITIONS, TERMINAL_ORDER_STATUSES

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (25): getRequestIp(), loginAction(), registerAction(), signOutAction(), AdminLayout(), authorized(), { handlers, auth, signIn, signOut }, ADMIN_ROLES (+17 more)

### Community 12 - "Community 12"
Cohesion: 0.40
Nodes (5): assertListingTransition(), canTransitionListing(), LISTING_STATUS_TRANSITIONS, PUBLIC_LISTING_STATUSES, SELLER_REVIEW_LISTING_STATUSES

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (5): code:bash (npm install), Getting Started, Scripts, Stack, Wardrobe Vault

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (5): 14. Selling, Authenticity, Basic Information, Images, Story

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (4): 1. Confirmed Stack, 2. Feature-Level Decisions, 3. Gaps Not Yet Covered — Recommended Defaults, Wardrobe Vault — Tech Spec Addendum

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (3): assertPayoutTransition(), canTransitionPayout(), PAYOUT_STATUS_TRANSITIONS

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (3): 7. Overall User Experience, Admin Side, User Side

### Community 19 - "Community 19"
Cohesion: 0.39
Nodes (7): buildClearSql(), buildSeedSql(), CATEGORIES, executeSql(), IDS, main(), q()

### Community 37 - "Community 37"
Cohesion: 0.15
Nodes (17): AuthActionState, initialState, LoginForm(), LoginFormProps, initialState, RegisterForm(), LoginPageProps, Button() (+9 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (8): Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead(), TableHeader(), TableRow()

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (3): JWT, Session, User

## Knowledge Gaps
- **213 isolated node(s):** `config`, `$schema`, `style`, `rsc`, `tsx` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 37`, `Community 38`, `Community 39`, `Community 7`, `Community 41`, `Community 40`, `Community 43`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `Wardrobe Vault — Master Development Prompt` connect `Community 1` to `Community 15`, `Community 18`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 5`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `config`, `$schema`, `style` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._