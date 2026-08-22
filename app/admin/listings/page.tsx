import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/brand/empty-state";
import { formatUgx } from "@/lib/format/currency";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import {
  getAdminListingQueue,
  getAdminListingQueueCounts,
  type AdminListingTab,
} from "@/lib/services/admin/listings";

const TABS: { id: AdminListingTab; label: string }[] = [
  { id: "pending", label: "Pending review" },
  { id: "approved", label: "Approved" },
  { id: "all", label: "All active" },
];

const STATUS_BADGE: Partial<
  Record<
    ListingStatus,
    { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
  >
> = {
  [ListingStatus.SUBMITTED]: { label: "Submitted", variant: "secondary" },
  [ListingStatus.UNDER_REVIEW]: { label: "Under review", variant: "secondary" },
  [ListingStatus.APPROVED]: { label: "Approved", variant: "default" },
  [ListingStatus.REJECTED]: { label: "Rejected", variant: "destructive" },
  [ListingStatus.PUBLISHED]: { label: "Published", variant: "default" },
  [ListingStatus.SUSPENDED]: { label: "Suspended", variant: "destructive" },
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

type SearchParams = Promise<{ tab?: string }>;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const validTabs: AdminListingTab[] = ["pending", "approved", "all"];
  const tabParam = params.tab;
  const normalizedTab =
    tabParam === "submitted" || tabParam === "under-review"
      ? "pending"
      : tabParam;
  const activeTab: AdminListingTab = validTabs.includes(
    normalizedTab as AdminListingTab,
  )
    ? (normalizedTab as AdminListingTab)
    : "pending";

  const [listings, counts] = await Promise.all([
    getAdminListingQueue(activeTab),
    getAdminListingQueueCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Listing review
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review and moderate listing submissions.
        </p>
      </div>

      {/* Tabs */}
      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 pb-px dark:border-zinc-800 sm:mx-0 sm:px-0">
        {TABS.map((tab) => {
          const count =
            tab.id === "pending" ? (counts.pending ?? 0) : tab.id === "approved" ? (counts.approved ?? 0) : undefined;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/listings?tab=${tab.id}`}
              className={[
                "inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "border-b-2 border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {count !== undefined && count > 0 ? (
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Table */}
      {listings.length === 0 ? (
        <EmptyState
          title="This queue is clear."
          description="No listings awaiting attention in this view."
        />
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {listings.map((listing) => {
            const thumb = listing.images[0];
            const badge = STATUS_BADGE[listing.status];
            return (
              <li key={listing.id}>
                <Link
                  href={`/admin/listings/${listing.id}`}
                  className="flex items-center gap-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40 -mx-2 px-2 rounded-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-800">
                    {thumb ? (
                      <Image
                        src={thumb.url}
                        alt={thumb.altText ?? listing.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[9px] text-zinc-400">
                        No photo
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {listing.title}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {listing.category?.name ?? "—"} ·{" "}
                      {formatUgx(listing.price)} ·{" "}
                      {listing.seller.name ?? listing.seller.email}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="hidden shrink-0 text-right text-xs text-zinc-400 sm:block">
                    <p>{formatDate(listing.submittedAt)}</p>
                    <p className="mt-0.5">Submitted</p>
                  </div>

                  {/* Status */}
                  {badge ? (
                    <Badge variant={badge.variant} className="shrink-0">
                      {badge.label}
                    </Badge>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
