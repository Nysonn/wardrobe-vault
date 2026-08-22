import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { SellerListingsTable } from "@/components/listings/seller-listings-table";
import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/guards";
import {
  countSellerListingsByTab,
  getSellerListings,
  type SellerListingTab,
} from "@/lib/services/listings";

const TABS: { id: SellerListingTab; label: string }[] = [
  { id: "published", label: "Published" },
  { id: "under-review", label: "Under review" },
  { id: "drafts", label: "Drafts" },
  { id: "sold", label: "Sold" },
  { id: "rejected", label: "Rejected" },
];

const EMPTY_STATE: Record<
  SellerListingTab,
  { title: string; description: string }
> = {
  published: {
    title: "Nothing is listed yet.",
    description: "Published pieces will appear here once approved.",
  },
  "under-review": {
    title: "Nothing is in review.",
    description: "Pieces you have submitted will appear here while we review them.",
  },
  drafts: {
    title: "No drafts saved.",
    description: "Start a listing and save it as a draft to pick it up later.",
  },
  sold: {
    title: "Nothing sold yet.",
    description: "Completed sales will appear here.",
  },
  rejected: {
    title: "No rejected listings.",
    description: "Pieces returned to you for changes will appear here.",
  },
};

type SearchParams = Promise<{ tab?: string; submitted?: string }>;

export default async function SellPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAuth();
  const params = await searchParams;

  const validTabs: SellerListingTab[] = [
    "published",
    "under-review",
    "drafts",
    "sold",
    "rejected",
  ];
  const activeTab: SellerListingTab = validTabs.includes(
    params.tab as SellerListingTab,
  )
    ? (params.tab as SellerListingTab)
    : "published";

  const [listings, counts] = await Promise.all([
    getSellerListings(session.user.id, activeTab),
    countSellerListingsByTab(session.user.id),
  ]);

  const empty = EMPTY_STATE[activeTab];

  return (
    <PageShell>
      <Section spacing="generous">
        <Container>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Sell
              </p>
              <h1 className="mt-1 font-heading text-4xl">My Listings</h1>
            </div>
            <Button render={<Link href="/sell/new" />} className="w-fit">
              + New listing
            </Button>
          </div>

          {params.submitted === "1" ? (
            <p className="mt-6 rounded-sm border border-border bg-muted px-4 py-3 text-sm text-foreground">
              Your listing has been submitted for review. We will notify you once it has been assessed.
            </p>
          ) : null}
        </Container>
      </Section>

      <Section spacing="compact">
        <Container>
          {/* Tab navigation */}
          <nav
            aria-label="Listing tabs"
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 pb-px sm:mx-0 sm:px-0"
          >
            {TABS.map((tab) => {
              const count = counts[tab.id] ?? 0;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/sell?tab=${tab.id}`}
                  className={[
                    "inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "border-b-2 border-foreground font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tab.label}
                  {count > 0 ? (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6">
            {listings.length > 0 ? (
              <SellerListingsTable listings={listings} />
            ) : (
              <EmptyState
                title={empty.title}
                description={empty.description}
                  action={
                    activeTab === "drafts" ? (
                      <Button render={<Link href="/sell/new" />}>
                        Create a listing
                      </Button>
                    ) : undefined
                  }
              />
            )}
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
