import { type ListingCondition } from "@/lib/generated/prisma/enums";
import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  ListingDocumentInput,
  ListingDraftInput,
  ListingImageInput,
  ShippingDetailInput,
} from "@/lib/schemas/listing";

type ListingImageWriteInput = Omit<ListingImageInput, "width" | "height"> & {
  width?: number;
  height?: number;
};

type ListingWriteInput = ListingDraftInput & {
  images?: ListingImageWriteInput[];
  documents?: ListingDocumentInput[];
  shipping?: Partial<ShippingDetailInput>;
};

/** Scalar fields safe to spread into both create and update data objects. */
type ListingScalarData = {
  categoryId?: string;
  brand?: string | null;
  designer?: string | null;
  price?: number;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  condition?: ListingCondition;
  wornByName?: string | null;
  wornBySeller?: boolean;
  wornWhere?: string | null;
  eventName?: string | null;
  eventDate?: Date | null;
  timesWorn?: number | null;
  storyDetails?: string | null;
  authenticityNotes?: string | null;
};

export function toListingData(input: ListingWriteInput): ListingScalarData {
  const data: ListingScalarData = {};

  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.brand !== undefined) data.brand = input.brand || null;
  if (input.designer !== undefined) data.designer = input.designer || null;
  if (input.price !== undefined) data.price = input.price;
  if (input.size !== undefined) data.size = input.size || null;
  if (input.color !== undefined) data.color = input.color || null;
  if (input.material !== undefined) data.material = input.material || null;
  if (input.condition !== undefined) data.condition = input.condition;
  if (input.wornByName !== undefined) data.wornByName = input.wornByName || null;
  if (input.wornBySeller !== undefined) data.wornBySeller = input.wornBySeller;
  if (input.wornWhere !== undefined) data.wornWhere = input.wornWhere || null;
  if (input.eventName !== undefined) data.eventName = input.eventName || null;
  if (input.eventDate !== undefined) data.eventDate = input.eventDate ?? null;
  if (input.timesWorn !== undefined) data.timesWorn = input.timesWorn ?? null;
  if (input.storyDetails !== undefined) {
    data.storyDetails = input.storyDetails || null;
  }
  if (input.authenticityNotes !== undefined) {
    data.authenticityNotes = input.authenticityNotes || null;
  }

  return data;
}

export function toShippingUpsert(input: ShippingDetailInput) {
  return {
    isAvailable: input.isAvailable,
    regions: input.regions,
    fee: input.fee,
    estimatedDaysMin: input.estimatedDaysMin ?? null,
    estimatedDaysMax: input.estimatedDaysMax ?? null,
    notes: input.notes ?? null,
  };
}

export function toImageCreateMany(
  listingId: string,
  images: ListingImageInput[],
): Prisma.ListingImageCreateManyInput[] {
  return images.map((image) => ({
    listingId,
    cloudinaryPublicId: image.cloudinaryPublicId,
    url: image.url,
    sortOrder: image.sortOrder,
    altText: image.altText ?? null,
    width: image.width,
    height: image.height,
  }));
}

export function toDocumentCreateMany(
  listingId: string,
  documents: ListingDocumentInput[],
): Prisma.ListingDocumentCreateManyInput[] {
  return documents.map((document) => ({
    listingId,
    type: document.type,
    cloudinaryPublicId: document.cloudinaryPublicId,
    url: document.url,
    fileName: document.fileName ?? null,
    mimeType: document.mimeType ?? null,
  }));
}
