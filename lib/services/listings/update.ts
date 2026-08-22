import {
  validateListingDocumentsForUser,
  validateListingImagesForUser,
} from "@/lib/cloudinary/validate";
import { prisma } from "@/lib/prisma";
import {
  listingDraftInputSchema,
  type ListingDraftInput,
} from "@/lib/schemas/listing";

import {
  assertCategoryExists,
  assertListingEditable,
  assertSellerOwnsListing,
} from "./access";
import { ListingServiceError, formatListingValidationError } from "./errors";
import {
  toDocumentCreateMany,
  toImageCreateMany,
  toListingData,
  toShippingUpsert,
} from "./mappers";

type UpdateListingDraftInput = {
  sellerId: string;
  listingId: string;
  data: ListingDraftInput;
};

export async function updateListingDraft({
  sellerId,
  listingId,
  data,
}: UpdateListingDraftInput) {
  const parsed = listingDraftInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new ListingServiceError(formatListingValidationError(parsed.error));
  }

  const input = parsed.data;
  const owned = await assertSellerOwnsListing(sellerId, listingId);
  assertListingEditable(owned.status);

  if (input.categoryId) {
    await assertCategoryExists(input.categoryId);
  }

  const images = input.images
    ? await validateListingImagesForUser(sellerId, input.images)
    : undefined;
  const documents = input.documents
    ? await validateListingDocumentsForUser(sellerId, input.documents)
    : undefined;

  const listingData = toListingData(input);

  return prisma.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: listingId },
      data: {
        ...listingData,
        ...(input.title ? { title: input.title } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
      },
    });

    if (input.shipping) {
      await tx.shippingDetail.upsert({
        where: { listingId },
        create: {
          listingId,
          ...toShippingUpsert({
            isAvailable: input.shipping.isAvailable ?? true,
            regions: input.shipping.regions ?? [],
            fee: input.shipping.fee ?? 0,
            estimatedDaysMin: input.shipping.estimatedDaysMin,
            estimatedDaysMax: input.shipping.estimatedDaysMax,
            notes: input.shipping.notes,
          }),
        },
        update: toShippingUpsert({
          isAvailable: input.shipping.isAvailable ?? true,
          regions: input.shipping.regions ?? [],
          fee: input.shipping.fee ?? 0,
          estimatedDaysMin: input.shipping.estimatedDaysMin,
          estimatedDaysMax: input.shipping.estimatedDaysMax,
          notes: input.shipping.notes,
        }),
      });
    }

    if (images) {
      await tx.listingImage.deleteMany({ where: { listingId } });
      if (images.length > 0) {
        await tx.listingImage.createMany({
          data: toImageCreateMany(listingId, images),
        });
      }
    }

    if (documents) {
      await tx.listingDocument.deleteMany({ where: { listingId } });
      if (documents.length > 0) {
        await tx.listingDocument.createMany({
          data: toDocumentCreateMany(listingId, documents),
        });
      }
    }

    return tx.listing.findUniqueOrThrow({
      where: { id: listingId },
      select: { id: true, status: true },
    });
  });
}
