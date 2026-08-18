/**
 * Search / browse service for public listings.
 *
 * Architecture note (tech-spec §2):
 * The public API (`searchListings`) is a thin wrapper around a `SearchAdapter`.
 * Today the adapter uses Prisma + Postgres ILIKE. When a dedicated search index
 * (e.g. Typesense, Meilisearch) is added, create a new adapter and swap the
 * import here — no call-site changes required.
 */
import { withDbRetry } from "@/lib/db/with-retry";
import { Prisma } from "@/lib/generated/prisma/client";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { SearchParams } from "@/lib/schemas/search";
import type { PublicListingCard } from "@/lib/services/listings/public";

// Re-use the same select shape as the homepage cards.
const searchListingSelect = {
  id: true,
  title: true,
  brand: true,
  designer: true,
  price: true,
  currency: true,
  wornByName: true,
  wornByUserId: true,
  eventName: true,
  storyVerifiedByVault: true,
  authenticityVerifiedByVault: true,
  _count: { select: { favorites: true } },
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { url: true, altText: true, width: true, height: true },
  },
  seller: {
    select: {
      id: true,
      name: true,
      isVerifiedPublicFigure: true,
      verificationStatus: true,
    },
  },
  wornBy: {
    select: {
      id: true,
      name: true,
      isVerifiedPublicFigure: true,
    },
  },
} as const;

export type SearchListingCard = Awaited<
  ReturnType<typeof prismaSearchAdapter>
>["listings"][number];

export type SearchResult = {
  listings: PublicListingCard[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

function buildWhere(params: SearchParams): Prisma.ListingWhereInput {
  const conditions: Prisma.ListingWhereInput[] = [
    { status: ListingStatus.PUBLISHED },
  ];

  if (params.q) {
    const term = `%${params.q}%`;
    conditions.push({
      OR: [
        { title: { contains: params.q, mode: "insensitive" } },
        { brand: { contains: params.q, mode: "insensitive" } },
        { designer: { contains: params.q, mode: "insensitive" } },
        { wornByName: { contains: params.q, mode: "insensitive" } },
        { eventName: { contains: params.q, mode: "insensitive" } },
        {
          wornBy: {
            name: { contains: params.q, mode: "insensitive" },
          },
        },
      ],
    });
    void term; // term kept for future raw-query adapter
  }

  if (params.brand) {
    conditions.push({
      brand: { contains: params.brand, mode: "insensitive" },
    });
  }

  if (params.designer) {
    conditions.push({
      designer: { contains: params.designer, mode: "insensitive" },
    });
  }

  if (params.categoryId) {
    conditions.push({ categoryId: params.categoryId });
  }

  if (params.condition) {
    conditions.push({ condition: params.condition });
  }

  if (params.priceMin !== undefined) {
    conditions.push({ price: { gte: params.priceMin } });
  }

  if (params.priceMax !== undefined) {
    conditions.push({ price: { lte: params.priceMax } });
  }

  if (params.verifiedFigure) {
    conditions.push({
      wornBy: { isVerifiedPublicFigure: true },
    });
  }

  return { AND: conditions };
}

function buildOrderBy(sort: SearchParams["sort"]): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "coveted":
      return [{ favorites: { _count: "desc" } }, { publishedAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }, { publishedAt: "desc" }];
    case "price-desc":
      return [{ price: "desc" }, { publishedAt: "desc" }];
    case "recent":
    default:
      return [{ publishedAt: "desc" }];
  }
}

async function prismaSearchAdapter(params: SearchParams) {
  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);
  const skip = (params.page - 1) * params.perPage;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: params.perPage,
      select: searchListingSelect,
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total };
}

/**
 * Public search entry-point. Swap `prismaSearchAdapter` for a dedicated
 * search-index adapter here when ready — call sites remain unchanged.
 */
export async function searchListings(params: SearchParams): Promise<SearchResult> {
  const { listings, total } = await withDbRetry(() =>
    prismaSearchAdapter(params),
  );

  return {
    listings: listings as unknown as PublicListingCard[],
    total,
    page: params.page,
    perPage: params.perPage,
    totalPages: Math.max(1, Math.ceil(total / params.perPage)),
  };
}
