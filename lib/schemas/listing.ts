import { z } from "zod";

import {
  ListingCondition,
  ListingDocumentType,
} from "@/lib/generated/prisma/enums";

export const LISTING_IMAGE_MAX_COUNT = 10;
export const LISTING_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const LISTING_IMAGE_MIN_LONG_EDGE_PX = 1200;
export const LISTING_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const LISTING_DOCUMENT_MAX_COUNT = 10;
export const LISTING_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const LISTING_DOCUMENT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

const listingConditionSchema = z.enum([
  ListingCondition.NEW_WITH_TAGS,
  ListingCondition.EXCELLENT,
  ListingCondition.VERY_GOOD,
  ListingCondition.GOOD,
  ListingCondition.FAIR,
  ListingCondition.WELL_LOVED,
]);

const listingDocumentTypeSchema = z.enum([
  ListingDocumentType.PROOF_OF_PURCHASE,
  ListingDocumentType.DESIGNER_DOCUMENTATION,
  ListingDocumentType.CERTIFICATE,
  ListingDocumentType.EVENT_PHOTOGRAPH,
  ListingDocumentType.OWNERSHIP_DOCUMENTATION,
  ListingDocumentType.OTHER,
]);

export const listingImageInputSchema = z.object({
  cloudinaryPublicId: z.string().trim().min(1),
  url: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sortOrder: z.number().int().min(0),
  altText: z.string().trim().max(200).optional(),
});

/** Draft saves may omit dimensions; Cloudinary re-validates before persisting. */
export const listingImageDraftInputSchema = listingImageInputSchema.extend({
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const listingDocumentInputSchema = z.object({
  type: listingDocumentTypeSchema,
  cloudinaryPublicId: z.string().trim().min(1),
  url: z.url(),
  fileName: z.string().trim().max(255).optional(),
  mimeType: z.string().trim().max(120).optional(),
});

export const shippingDetailInputSchema = z.object({
  isAvailable: z.boolean(),
  regions: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  fee: z.number().int().min(0),
  estimatedDaysMin: z.number().int().positive().optional(),
  estimatedDaysMax: z.number().int().positive().optional(),
  notes: z.string().trim().max(500).optional(),
});

const listingCoreFieldsSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  categoryId: z.string().trim().min(1, "Choose a category."),
  brand: z.string().trim().max(120).optional(),
  designer: z.string().trim().max(120).optional(),
  price: z
    .number()
    .int("Price must be a whole number of shillings.")
    .positive("Price must be greater than zero."),
  size: z.string().trim().max(80).optional(),
  color: z.string().trim().max(80).optional(),
  material: z.string().trim().max(120).optional(),
  condition: listingConditionSchema,
  wornByName: z.string().trim().max(120).optional(),
  wornBySeller: z.boolean().default(false),
  wornWhere: z.string().trim().max(200).optional(),
  eventName: z.string().trim().max(200).optional(),
  eventDate: z.coerce.date().optional(),
  timesWorn: z.number().int().min(0).max(9999).optional(),
  storyDetails: z
    .string()
    .trim()
    .min(40, "Share a little more of the piece's story.")
    .max(5000),
  authenticityNotes: z.string().trim().max(3000).optional(),
  images: z
    .array(listingImageInputSchema)
    .min(1, "Add at least one photograph.")
    .max(LISTING_IMAGE_MAX_COUNT),
  documents: z.array(listingDocumentInputSchema).max(LISTING_DOCUMENT_MAX_COUNT).default([]),
  shipping: shippingDetailInputSchema,
});

/** Partial listing payload for save-as-draft — only validates fields that are present. */
export const listingDraftInputSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    categoryId: z.string().trim().min(1).optional(),
    brand: z.string().trim().max(120).optional(),
    designer: z.string().trim().max(120).optional(),
    price: z.number().int().positive().optional(),
    size: z.string().trim().max(80).optional(),
    color: z.string().trim().max(80).optional(),
    material: z.string().trim().max(120).optional(),
    condition: listingConditionSchema.optional(),
    wornByName: z.string().trim().max(120).optional(),
    wornBySeller: z.boolean().optional(),
    wornWhere: z.string().trim().max(200).optional(),
    eventName: z.string().trim().max(200).optional(),
    eventDate: z.coerce.date().optional(),
    timesWorn: z.number().int().min(0).max(9999).optional(),
    storyDetails: z.string().trim().max(5000).optional(),
    authenticityNotes: z.string().trim().max(3000).optional(),
    images: z.array(listingImageDraftInputSchema).max(LISTING_IMAGE_MAX_COUNT).optional(),
    documents: z.array(listingDocumentInputSchema).max(LISTING_DOCUMENT_MAX_COUNT).optional(),
    shipping: shippingDetailInputSchema.partial().optional(),
  })
  .strict();

/** Full validation applied on submit-for-review. */
export const listingSubmitInputSchema = listingCoreFieldsSchema
  .refine((data) => Boolean(data.brand?.trim() || data.designer?.trim()), {
    message: "Add a brand or designer name.",
    path: ["brand"],
  })
  .refine((data) => data.wornBySeller || Boolean(data.wornByName?.trim()), {
    message: "Tell us who wore this piece, or mark that you wore it.",
    path: ["wornByName"],
  })
  .refine(
    (data) =>
      data.images.every(
        (image) =>
          Math.max(image.width, image.height) >= LISTING_IMAGE_MIN_LONG_EDGE_PX,
      ),
    {
      message: `Each photograph must be at least ${LISTING_IMAGE_MIN_LONG_EDGE_PX}px on the longest edge.`,
      path: ["images"],
    },
  );

export type ListingImageInput = z.infer<typeof listingImageInputSchema>;
export type ListingImageDraftInput = z.infer<typeof listingImageDraftInputSchema>;
export type ListingDocumentInput = z.infer<typeof listingDocumentInputSchema>;
export type ShippingDetailInput = z.infer<typeof shippingDetailInputSchema>;
export type ListingDraftInput = z.infer<typeof listingDraftInputSchema>;
export type ListingSubmitInput = z.infer<typeof listingCoreFieldsSchema>;

/** Parse JSON payload from the listing form (client → server action). */
export function parseListingPayload(raw: unknown) {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  return raw;
}

export const LISTING_CONDITION_LABELS: Record<ListingCondition, string> = {
  [ListingCondition.NEW_WITH_TAGS]: "New with tags",
  [ListingCondition.EXCELLENT]: "Excellent",
  [ListingCondition.VERY_GOOD]: "Very good",
  [ListingCondition.GOOD]: "Good",
  [ListingCondition.FAIR]: "Fair",
  [ListingCondition.WELL_LOVED]: "Well loved",
};

export const LISTING_DOCUMENT_TYPE_LABELS: Record<ListingDocumentType, string> = {
  [ListingDocumentType.PROOF_OF_PURCHASE]: "Proof of purchase",
  [ListingDocumentType.DESIGNER_DOCUMENTATION]: "Designer documentation",
  [ListingDocumentType.CERTIFICATE]: "Certificate",
  [ListingDocumentType.EVENT_PHOTOGRAPH]: "Event photograph",
  [ListingDocumentType.OWNERSHIP_DOCUMENTATION]: "Ownership documentation",
  [ListingDocumentType.OTHER]: "Other supporting evidence",
};
