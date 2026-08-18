import { z } from "zod";

export const listingConditions = [
  "NEW_WITH_TAGS",
  "EXCELLENT",
  "VERY_GOOD",
  "GOOD",
  "FAIR",
  "WELL_LOVED",
] as const;

export const searchSortOptions = [
  "recent",
  "coveted",
  "price-asc",
  "price-desc",
] as const;

export type SearchSort = (typeof searchSortOptions)[number];

/**
 * Parsed, validated search params for listing search.
 * Used by both client filter forms and the server `searchListings()` call.
 */
export const SearchParamsSchema = z.object({
  /** Full-text query — matched against title, brand, designer, wornByName, eventName */
  q: z.string().trim().max(200).optional(),
  brand: z.string().trim().max(100).optional(),
  designer: z.string().trim().max(100).optional(),
  categoryId: z.string().cuid().optional(),
  condition: z
    .enum(listingConditions)
    .optional(),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().nonnegative().optional(),
  /** Only show listings with a linked verified public figure in wornBy */
  verifiedFigure: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z.enum(searchSortOptions).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

/** Parse raw URL searchParams object (all string values) into typed SearchParams */
export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
): SearchParams {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(raw)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }
  const result = SearchParamsSchema.safeParse(flat);
  return result.success ? result.data : SearchParamsSchema.parse({});
}
