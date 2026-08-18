import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/brand/empty-state";
import { ListingStatus } from "@/lib/generated/prisma/enums";

type SellerListing = {
  id: string;
  title: string;
  price: number;
  status: ListingStatus;
  updatedAt: Date;
  category: { name: string } | null;
  images: { url: string; altText: string | null }[];
};

const STATUS_LABEL: Partial<Record<ListingStatus, string>> = {
  [ListingStatus.DRAFT]: "Draft",
  [ListingStatus.SUBMITTED]: "Submitted",
  [ListingStatus.UNDER_REVIEW]: "Under review",
  [ListingStatus.APPROVED]: "Approved",
  [ListingStatus.REJECTED]: "Rejected",
  [ListingStatus.PUBLISHED]: "Published",
  [ListingStatus.SUSPENDED]: "Suspended",
  [ListingStatus.SOLD]: "Sold",
  [ListingStatus.ARCHIVED]: "Archived",
};

const STATUS_VARIANT: Partial<
  Record<ListingStatus, "default" | "secondary" | "outline" | "destructive">
> = {
  [ListingStatus.PUBLISHED]: "default",
  [ListingStatus.SOLD]: "secondary",
  [ListingStatus.SUBMITTED]: "secondary",
  [ListingStatus.UNDER_REVIEW]: "secondary",
  [ListingStatus.APPROVED]: "secondary",
  [ListingStatus.REJECTED]: "destructive",
  [ListingStatus.DRAFT]: "outline",
  [ListingStatus.SUSPENDED]: "destructive",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

type Props = {
  listings: SellerListing[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function SellerListingsTable({
  listings,
  emptyTitle = "Nothing here yet.",
  emptyDescription,
}: Props) {
  if (listings.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="divide-y divide-border">
      {listings.map((listing) => {
        const thumb = listing.images[0];
        const label = STATUS_LABEL[listing.status] ?? listing.status;
        const variant = STATUS_VARIANT[listing.status] ?? "outline";
        const canEdit =
          listing.status === ListingStatus.DRAFT ||
          listing.status === ListingStatus.REJECTED;

        return (
          <li key={listing.id} className="flex items-center gap-4 py-4">
            {/* Thumbnail */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-muted">
              {thumb ? (
                <Image
                  src={thumb.url}
                  alt={thumb.altText ?? listing.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                  No photo
                </span>
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {listing.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {listing.category?.name ?? "Uncategorised"} ·{" "}
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* Status + action */}
            <div className="flex shrink-0 items-center gap-3">
              <Badge variant={variant}>{label}</Badge>
              {canEdit ? (
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/sell/${listing.id}`} />}
                >
                  Edit
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
