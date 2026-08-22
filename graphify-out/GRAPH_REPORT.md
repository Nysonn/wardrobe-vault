# Graph Report - wardrobe-web-app  (2026-08-22)

## Corpus Check
- 245 files · ~65,693 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1256 nodes · 2885 edges · 79 communities (66 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b89f5c91`
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
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 120 edges
2. `Wardrobe Vault — Master Development Prompt` - 54 edges
3. `requireAuth()` - 45 edges
4. `Button()` - 44 edges
5. `resolveActionError()` - 37 edges
6. `validationMessage()` - 33 edges
7. `requireAdmin()` - 26 edges
8. `formatUgx()` - 26 edges
9. `Container()` - 23 edges
10. `Badge()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuSubContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts

## Communities (79 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (27): PayoutActionPanel(), AdminPayoutError, AdminPayoutTab, getAdminPayoutDetail(), getAdminPayoutQueue(), getAdminPayoutQueueCounts(), TAB_KEYS, tabToStatus() (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): 13. Verified Public Figures, 15. Draft Listings, 17. Admin Listing Review, 18. Buying Flow, 19. Platform Commission, 1. Project Vision, 20. Payout System, 21. Payment Architecture (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (28): dependencies, @auth/prisma-adapter, @base-ui/react, bcryptjs, class-variance-authority, cloudinary, clsx, @hookform/resolvers (+20 more)

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
Cohesion: 0.11
Nodes (22): reportListingAction(), ReportListingActionState, AdminReportAction, AdminReportError, AdminReportTab, getAdminReportDetail(), getAdminReportQueue(), getAdminReportQueueCounts() (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (13): 10. When Uncertain, 11. Plan Progress (`docs/plan.md`), 1. No Fake Functionality, 2. Server Is the Source of Truth, 3. Authorization, 4. Database & Migrations, 5. Secrets & Config, 6. Audit Trail (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (8): Build Order, CLAUDE.md — Wardrobe Vault, code:block1 (app/), Definition of Done for Any Page/Feature, Non-Negotiables (see AGENTS.md for full detail), Repository Conventions, Stack, What This Project Is

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (47): assertListingTransition(), createNotifications(), calculateOrderTotals(), deepEqual(), MANUAL_ORDER_TOTALS_TEST_CASES, ManualTestCase, result, runManualOrderTotalsTests() (+39 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (14): formatRelativeTime(), NotificationItem, NotificationPreview(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (20): validateListingDocumentsForUser(), validateListingImagesForUser(), assertCategoryExists(), assertListingEditable(), assertSellerOwnsListing(), getDefaultCategoryId(), SELLER_EDITABLE_LISTING_STATUSES, createListing() (+12 more)

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
Cohesion: 0.21
Nodes (15): AuthActionState, PageProps, initialState, LoginFormProps, initialState, Category, initialState, ListingFormDefaultValues (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (3): 7. Overall User Experience, Admin Side, User Side

### Community 19 - "Community 19"
Cohesion: 0.39
Nodes (7): buildClearSql(), buildSeedSql(), CATEGORIES, executeSql(), IDS, main(), q()

### Community 21 - "Community 21"
Cohesion: 0.06
Nodes (47): PageProps, Home(), normalizeDatabaseUrl(), RETRYABLE_CODES, withDbRetry(), adapter, getConnectionString(), globalForPrisma (+39 more)

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (12): ACTION_LABELS, actionToStatus(), AdminActionInput, AdminListingAction, AdminListingError, buildSellerNotification(), NotificationPayload, performAdminListingAction() (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.23
Nodes (8): formatDate(), PageProps, getSession(), ListingDetailPage(), ListingPurchaseBar(), ListingPurchaseBarProps, WishlistButton(), WishlistButtonProps

### Community 39 - "Community 39"
Cohesion: 0.13
Nodes (21): SiteHeaderShell(), SiteHeaderShellProps, cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount() (+13 more)

### Community 40 - "Community 40"
Cohesion: 0.08
Nodes (40): MessageActionState, MessageServiceError, MessageComposer(), MessageComposerProps, MessageThread(), MessageThreadProps, StreamMessageLike, StreamMessageThread() (+32 more)

### Community 41 - "Community 41"
Cohesion: 0.05
Nodes (64): CheckoutActionState, confirmPurchaseAction(), sendMessageAction(), AdminCategoryError, createCategory(), createCategoryAction(), updateCategory(), updateCategoryAction() (+56 more)

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (3): JWT, Session, User

### Community 43 - "Community 43"
Cohesion: 0.07
Nodes (28): getRequestIp(), loginAction(), registerAction(), signOutAction(), AdminLayout(), NAV_LINKS, authorized(), { handlers, auth, signIn, signOut } (+20 more)

### Community 44 - "Community 44"
Cohesion: 0.26
Nodes (9): ACTION_LABELS, AdminActionInput, AdminVerificationAction, AdminVerificationError, performAdminVerificationAction(), createNotification(), completePayout(), notifyVerificationApproved() (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Animation conventions (§36), Anti-AI-design checklist (§45), Brand components, Do, Don't, Layout primitives, Palette (`app/globals.css`), Phase 3 foundation status (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (12): MarketplaceSettingsForm(), AdminSettingsError, ensureDefaultPlatformSettings(), getPlatformSettings(), PlatformSettingsSnapshot, resolveSetting(), updatePlatformSettings(), upsertSetting() (+4 more)

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (8): AdminListingTab, getAdminListingQueue(), getAdminListingQueueCounts(), tabToStatuses(), AdminListingsPage(), SearchParams, STATUS_BADGE, TABS

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (16): CloudinaryConfigError, configureCloudinary(), documentUploadFolder(), getCloudinaryConfig(), listingUploadFolder(), requireEnv(), assertFolder(), CloudinaryResource (+8 more)

### Community 49 - "Community 49"
Cohesion: 0.13
Nodes (17): OrderActionPanel(), Props, TransitionOption, AdminOrderTab, getAdminOrderDetail(), getAdminOrderQueue(), getAdminOrderQueueCounts(), tabToStatuses() (+9 more)

### Community 50 - "Community 50"
Cohesion: 0.15
Nodes (17): parseEvidenceUrls(), submitVerificationApplicationAction(), VerificationActionState, AdminVerificationActionInput, adminVerificationActionSchema, VerificationApplicationInput, verificationApplicationSchema, VerificationEvidenceInput (+9 more)

### Community 51 - "Community 51"
Cohesion: 0.11
Nodes (21): Pagination(), PaginationProps, SearchBar(), SearchBarProps, Category, conditionLabels, SearchFilters(), SearchFiltersProps (+13 more)

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (8): scripts, build, db:migrate, db:seed, dev, lint, start, test:order-totals

### Community 53 - "Community 53"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 54 - "Community 54"
Cohesion: 0.11
Nodes (20): Option, Props, TYPE_LABELS, initialState, Props, initialState, PayoutActionOption, Props (+12 more)

### Community 55 - "Community 55"
Cohesion: 0.14
Nodes (16): PageProps, Container(), ContainerProps, widthClasses, HeroSection(), HeroSectionProps, PageShell(), PageShellProps (+8 more)

### Community 56 - "Community 56"
Cohesion: 0.25
Nodes (9): getAdminListingDetail(), formatDate(), PageProps, AdminListingDetailPage(), formatDate(), formatPrice(), STATUS_LABEL, STATUS_VARIANT (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.09
Nodes (23): ImageUploader(), Props, UploadState, ListingImageWriteInput, ListingScalarData, ListingWriteInput, toDocumentCreateMany(), toImageCreateMany() (+15 more)

### Community 58 - "Community 58"
Cohesion: 0.24
Nodes (9): AdminCategoryActionState, listAdminCategories(), CategoryCreateForm(), initialState, CategoryRow(), CategoryRowProps, initialState, AdminCategoriesPage() (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.24
Nodes (8): VerificationBadge(), VerificationBadgeProps, ProfileSummary, WornByBlock(), WornByBlockProps, formatDate(), STATUS_COPY, VerifyPage()

### Community 60 - "Community 60"
Cohesion: 0.18
Nodes (17): CloudinaryUploadResponse, getSignature(), resolveImageDimensions(), SignResponse, UploadError, uploadListingDocument(), uploadListingImage(), uploadToCloudinary() (+9 more)

### Community 61 - "Community 61"
Cohesion: 0.24
Nodes (8): AdminVerificationTab, getAdminVerificationQueue(), getAdminVerificationQueueCounts(), tabToStatuses(), AdminVerificationPage(), SearchParams, STATUS_BADGE, TABS

### Community 62 - "Community 62"
Cohesion: 0.38
Nodes (3): getAdminOverviewMetrics(), AdminPage(), OverviewRowProps

### Community 63 - "Community 63"
Cohesion: 0.14
Nodes (19): getAdminUserDetail(), PageProps, PageProps, NotFound(), formatUgx(), UGX_FORMATTER, CheckoutPage(), ORDER_STATUS_LABELS (+11 more)

### Community 64 - "Community 64"
Cohesion: 0.28
Nodes (7): markAllNotificationsReadAction(), markNotificationReadAction(), ADMIN_ROLES, AuthenticatedSession, requireAuth(), MessagesPage(), NotificationsPage()

### Community 65 - "Community 65"
Cohesion: 0.24
Nodes (14): bool(), collectListingFields(), collectSubmitFields(), createListingAction(), DEFAULT_SHIPPING, getListingId(), ListingActionState, num() (+6 more)

### Community 66 - "Community 66"
Cohesion: 0.38
Nodes (5): getAdminVerificationDetail(), AdminVerificationDetailPage(), formatDate(), PageProps, STATUS_LABEL

### Community 68 - "Community 68"
Cohesion: 0.13
Nodes (17): GalleryImage, ListingGallery(), ListingGalleryProps, initialState, REPORT_REASONS, ReportListingDialog(), ReportListingDialogProps, Dialog() (+9 more)

### Community 69 - "Community 69"
Cohesion: 0.35
Nodes (7): CreateNotificationInput, TransactionClient, getUnreadNotificationCount(), listNotifications(), markAllNotificationsRead(), markNotificationRead(), GET()

### Community 70 - "Community 70"
Cohesion: 0.15
Nodes (13): searchAdminUsers(), EmptyState(), EmptyStateProps, Props, SellerListing, SellerListingsTable(), STATUS_LABEL, STATUS_VARIANT (+5 more)

### Community 71 - "Community 71"
Cohesion: 0.23
Nodes (9): toggleWishlistAction(), WishlistActionState, WishlistListingIdInput, wishlistListingIdSchema, WishlistServiceError, isListingFavorited(), addFavorite(), removeFavorite() (+1 more)

### Community 72 - "Community 72"
Cohesion: 0.43
Nodes (5): formatPrice(), ItemCard(), ItemCardProps, listUserFavorites(), WishlistPage()

### Community 73 - "Community 73"
Cohesion: 0.26
Nodes (8): ErrorPageProps, ErrorState(), ErrorStateProps, PUBLIC_LINKS, SiteHeaderMenu(), SiteHeaderMenuProps, Button(), buttonVariants

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (5): ActionConfig, initialState, Props, VerificationActionPanel(), AdminVerificationActionState

### Community 75 - "Community 75"
Cohesion: 0.25
Nodes (7): SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectValue()

### Community 76 - "Community 76"
Cohesion: 0.29
Nodes (6): ACTION_CONFIGS, ActionConfig, initialState, ListingActionPanel(), Props, AdminListingActionState

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

## Knowledge Gaps
- **436 isolated node(s):** `config`, `$schema`, `style`, `rsc`, `tsx` (+431 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 39` to `Community 68`, `Community 38`, `Community 70`, `Community 72`, `Community 73`, `Community 40`, `Community 43`, `Community 11`, `Community 75`, `Community 78`, `Community 17`, `Community 51`, `Community 21`, `Community 54`, `Community 55`, `Community 58`, `Community 59`, `Community 63`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 73` to `Community 17`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 43`, `Community 49`, `Community 50`, `Community 54`, `Community 55`, `Community 57`, `Community 58`, `Community 59`, `Community 60`, `Community 63`, `Community 64`, `Community 68`, `Community 70`, `Community 72`, `Community 74`, `Community 76`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 63` to `Community 0`, `Community 66`, `Community 38`, `Community 70`, `Community 72`, `Community 41`, `Community 7`, `Community 39`, `Community 47`, `Community 49`, `Community 56`, `Community 61`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `config`, `$schema`, `style` to the rest of the system?**
  _436 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08636977058029689 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._