import { withDbRetry } from "@/lib/db/with-retry";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { SELLER_REVIEW_LISTING_STATUSES } from "@/lib/services/listings/stateMachine";

export async function getActiveCategories() {
  return withDbRetry(() =>
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  );
}

const sellerListingInclude = {
  category: { select: { name: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { url: true, altText: true },
  },
} as const;

export type SellerListingTab =
  | "published"
  | "drafts"
  | "under-review"
  | "sold"
  | "rejected";

export function tabToStatuses(tab: SellerListingTab): ListingStatus[] {
  switch (tab) {
    case "published":
      return [ListingStatus.PUBLISHED, ListingStatus.SUSPENDED];
    case "drafts":
      return [ListingStatus.DRAFT, ListingStatus.ARCHIVED];
    case "under-review":
      return [...SELLER_REVIEW_LISTING_STATUSES];
    case "sold":
      return [ListingStatus.SOLD];
    case "rejected":
      return [ListingStatus.REJECTED];
    default:
      return [ListingStatus.DRAFT];
  }
}

export async function getSellerListings(
  sellerId: string,
  tab: SellerListingTab,
) {
  const statuses = tabToStatuses(tab);

  return prisma.listing.findMany({
    where: {
      sellerId,
      status: { in: statuses },
    },
    orderBy: [{ updatedAt: "desc" }],
    include: sellerListingInclude,
  });
}

export async function getSellerListingForEdit(
  sellerId: string,
  listingId: string,
) {
  return prisma.listing.findFirst({
    where: { id: listingId, sellerId },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { createdAt: "asc" } },
      shippingDetail: true,
    },
  });
}

export async function countSellerListingsByTab(sellerId: string) {
  const tabs: SellerListingTab[] = [
    "published",
    "drafts",
    "under-review",
    "sold",
    "rejected",
  ];

  const counts = await Promise.all(
    tabs.map(async (tab) => {
      const count = await prisma.listing.count({
        where: {
          sellerId,
          status: { in: tabToStatuses(tab) },
        },
      });
      return [tab, count] as const;
    }),
  );

  return Object.fromEntries(counts) as Record<SellerListingTab, number>;
}
