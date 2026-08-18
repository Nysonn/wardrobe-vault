# Graph Report - wardrobe-web-app  (2026-08-18)

## Corpus Check
- 155 files · ~47,172 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 893 nodes · 1798 edges · 54 communities (42 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dbc2b958`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 21|Community 21]]
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
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 104 edges
2. `Wardrobe Vault — Master Development Prompt` - 54 edges
3. `requireAuth()` - 26 edges
4. `Button()` - 23 edges
5. `compilerOptions` - 16 edges
6. `Container()` - 15 edges
7. `Wardrobe Vault — Build Plan` - 15 edges
8. `Section()` - 14 edges
9. `withDbRetry()` - 13 edges
10. `formatUgx()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DropdownMenuContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuItem()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts

## Communities (54 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (16): ADMIN_ROLES, AuthenticatedSession, formatUgx(), UGX_FORMATTER, ORDER_STATUS_LABELS, OrderDetailPage(), PageProps, ORDER_STATUS_LABELS (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): 13. Verified Public Figures, 15. Draft Listings, 17. Admin Listing Review, 18. Buying Flow, 19. Platform Commission, 1. Project Vision, 20. Payout System, 21. Payment Architecture (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (27): dependencies, @auth/prisma-adapter, @base-ui/react, bcryptjs, class-variance-authority, cloudinary, clsx, @hookform/resolvers (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (21): 1.1 Schema Design, 1.2 Migrations & Seed, 6.1 Homepage & Discovery, 6.2 Search & Filtering, 6.3 Item Detail Page, 6.4 Profiles, Out of Scope for MVP (Do Not Build — Architect For Only), Phase 0 — Project Scaffolding (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (15): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (11): GalleryImage, ListingGallery(), ListingGalleryProps, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (13): 10. When Uncertain, 11. Plan Progress (`docs/plan.md`), 1. No Fake Functionality, 2. Server Is the Source of Truth, 3. Authorization, 4. Database & Migrations, 5. Secrets & Config, 6. Audit Trail (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (8): Build Order, CLAUDE.md — Wardrobe Vault, code:block1 (app/), Definition of Done for Any Page/Feature, Non-Negotiables (see AGENTS.md for full detail), Repository Conventions, Stack, What This Project Is

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (50): CheckoutActionState, confirmPurchaseAction(), ConfirmPurchaseForm(), ConfirmPurchaseFormProps, assertListingTransition(), calculateOrderTotals(), deepEqual(), MANUAL_ORDER_TOTALS_TEST_CASES (+42 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (49): CloudinaryConfigError, configureCloudinary(), documentUploadFolder(), getCloudinaryConfig(), listingUploadFolder(), requireEnv(), assertFolder(), CloudinaryResource (+41 more)

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (5): code:bash (npm install), Getting Started, Scripts, Stack, Wardrobe Vault

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (5): geistMono, geistSans, headingFont, metadata, sansFont

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (5): 14. Selling, Authenticity, Basic Information, Images, Story

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (4): 1. Confirmed Stack, 2. Feature-Level Decisions, 3. Gaps Not Yet Covered — Recommended Defaults, Wardrobe Vault — Tech Spec Addendum

### Community 17 - "Community 17"
Cohesion: 0.07
Nodes (33): getAdminListingQueueCounts(), AdminPage(), initialState, PayoutActionOption, PayoutActionPanel(), Props, adminPayoutActionAction(), AdminPayoutActionState (+25 more)

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (3): 7. Overall User Experience, Admin Side, User Side

### Community 19 - "Community 19"
Cohesion: 0.39
Nodes (7): buildClearSql(), buildSeedSql(), CATEGORIES, executeSql(), IDS, main(), q()

### Community 21 - "Community 21"
Cohesion: 0.06
Nodes (43): Home(), normalizeDatabaseUrl(), RETRYABLE_CODES, withDbRetry(), adapter, getConnectionString(), globalForPrisma, PUBLIC_DETAIL_STATUSES (+35 more)

### Community 37 - "Community 37"
Cohesion: 0.07
Nodes (45): AuthActionState, Option, Props, TYPE_LABELS, PageProps, initialState, LoginForm(), LoginFormProps (+37 more)

### Community 38 - "Community 38"
Cohesion: 0.15
Nodes (16): PageProps, Container(), ContainerProps, widthClasses, PageShell(), PageShellProps, Section(), SectionProps (+8 more)

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (19): cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), CardAction() (+11 more)

### Community 40 - "Community 40"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 41 - "Community 41"
Cohesion: 0.11
Nodes (25): bool(), collectListingFields(), collectSubmitFields(), createListingAction(), getListingId(), ListingActionState, num(), parseJsonField() (+17 more)

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (3): JWT, Session, User

### Community 43 - "Community 43"
Cohesion: 0.07
Nodes (36): ACTION_CONFIGS, ActionConfig, initialState, ListingActionPanel(), Props, ACTION_LABELS, actionToStatus(), AdminActionInput (+28 more)

### Community 44 - "Community 44"
Cohesion: 0.15
Nodes (15): EmptyState(), EmptyStateProps, formatPrice(), ItemCard(), ItemCardProps, Pagination(), PaginationProps, PublicListingCard (+7 more)

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Animation conventions (§36), Anti-AI-design checklist (§45), Brand components, Do, Don't, Layout primitives, Palette (`app/globals.css`), Phase 3 foundation status (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.13
Nodes (22): AdminCommissionActionState, AdminCommissionError, createCommissionSetting(), createCommissionSettingAction(), getCommissionFormOptions(), getCommissionSettings(), CommissionSettingCreateForm(), CommissionSettingRow() (+14 more)

### Community 47 - "Community 47"
Cohesion: 0.17
Nodes (14): countSellerListingsByTab(), getSellerListings(), sellerListingInclude, SellerListingTab, tabToStatuses(), Props, SellerListing, SellerListingsTable() (+6 more)

### Community 48 - "Community 48"
Cohesion: 0.10
Nodes (19): getRequestIp(), loginAction(), registerAction(), signOutAction(), AdminLayout(), authorized(), { handlers, auth, signIn, signOut }, isAdminRole() (+11 more)

### Community 49 - "Community 49"
Cohesion: 0.19
Nodes (11): formatDate(), PageProps, getSession(), VerificationBadge(), VerificationBadgeProps, generateMetadata(), ListingDetailPage(), getPublicListingDetail() (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.15
Nodes (14): initialState, REPORT_REASONS, ReportListingDialog(), ReportListingDialogProps, SelectContent(), SelectGroup(), SelectItem(), SelectLabel() (+6 more)

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (8): scripts, build, db:migrate, db:seed, dev, lint, start, test:order-totals

### Community 53 - "Community 53"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **353 isolated node(s):** `config`, `$schema`, `style`, `rsc`, `tsx` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 39` to `Community 0`, `Community 37`, `Community 38`, `Community 7`, `Community 40`, `Community 11`, `Community 44`, `Community 49`, `Community 50`, `Community 51`, `Community 21`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 37` to `Community 0`, `Community 38`, `Community 7`, `Community 39`, `Community 10`, `Community 43`, `Community 46`, `Community 47`, `Community 17`, `Community 50`, `Community 51`, `Community 49`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `requireAuth()` connect `Community 41` to `Community 0`, `Community 37`, `Community 38`, `Community 10`, `Community 46`, `Community 47`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `config`, `$schema`, `style` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14492753623188406 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._