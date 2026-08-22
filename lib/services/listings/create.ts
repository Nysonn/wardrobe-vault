import {
  validateListingDocumentsForUser,
  validateListingImagesForUser,
} from "@/lib/cloudinary/validate";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  listingDraftInputSchema,
  type ListingDraftInput,
} from "@/lib/schemas/listing";

import {
  assertCategoryExists,
  getDefaultCategoryId,
} from "./access";
import { ListingServiceError, formatListingValidationError } from "./errors";
import {
  toDocumentCreateMany,
  toImageCreateMany,
  toListingData,
  toShippingUpsert,
} from "./mappers";

type CreateListingInput = {
  sellerId: string;
  data: ListingDraftInput;
};

export async function createListing({ sellerId, data }: CreateListingInput) {
  const parsed = listingDraftInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new ListingServiceError(formatListingValidationError(parsed.error));
  }

  const input = parsed.data;
  const categoryId = input.categoryId ?? (await getDefaultCategoryId());

  if (input.categoryId) {
    await assertCategoryExists(input.categoryId);
  }

  const images = input.images
    ? await validateListingImagesForUser(sellerId, input.images)
    : [];
  const documents = input.documents
    ? await validateListingDocumentsForUser(sellerId, input.documents)
    : [];

  const listingData = toListingData(input);

  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.create({
      data: {
        sellerId,
        categoryId,
        title: input.title?.trim() || "Untitled draft",
        price: input.price ?? 0,
        currency: "UGX",
        status: ListingStatus.DRAFT,
        ...listingData,
        shippingDetail: input.shipping
          ? {
              create: toShippingUpsert({
                isAvailable: input.shipping.isAvailable ?? true,
                regions: input.shipping.regions ?? [],
                fee: input.shipping.fee ?? 0,
                estimatedDaysMin: input.shipping.estimatedDaysMin,
                estimatedDaysMax: input.shipping.estimatedDaysMax,
                notes: input.shipping.notes,
              }),
            }
          : {
              create: {
                isAvailable: true,
                regions: [],
                fee: 0,
              },
            },
      },
      select: { id: true, status: true },
    });

    if (images.length > 0) {
      await tx.listingImage.createMany({
        data: toImageCreateMany(listing.id, images),
      });
    }

    if (documents.length > 0) {
      await tx.listingDocument.createMany({
        data: toDocumentCreateMany(listing.id, documents),
      });
    }

    await tx.listingStatusHistory.create({
      data: {
        listingId: listing.id,
        fromStatus: null,
        toStatus: ListingStatus.DRAFT,
        actorId: sellerId,
        notes: "Listing created as draft.",
      },
    });

    return listing;
  });
}
