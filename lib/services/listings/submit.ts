import {
  validateListingDocumentsForUser,
  validateListingImagesForUser,
} from "@/lib/cloudinary/validate";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import {
  listingSubmitInputSchema,
  type ListingSubmitInput,
} from "@/lib/schemas/listing";

import {
  assertCategoryExists,
  assertListingEditable,
  assertSellerOwnsListing,
} from "./access";
import { ListingServiceError, formatListingValidationError } from "./errors";
import { updateListingDraft } from "./update";
import { transitionListingStatus } from "./transitionStatus";

type SubmitListingInput = {
  sellerId: string;
  listingId: string;
  data: ListingSubmitInput;
};

export async function submitListingForReview({
  sellerId,
  listingId,
  data,
}: SubmitListingInput) {
  const normalizedImages = data.images?.length
    ? await validateListingImagesForUser(sellerId, data.images)
    : data.images;

  const parsed = listingSubmitInputSchema.safeParse({
    ...data,
    images: normalizedImages,
    documents: data.documents ?? [],
    shipping: data.shipping ?? {
      isAvailable: true,
      regions: [],
      fee: 0,
    },
  });
  if (!parsed.success) {
    throw new ListingServiceError(
      formatListingValidationError(parsed.error),
    );
  }

  const input = parsed.data;
  const owned = await assertSellerOwnsListing(sellerId, listingId);
  assertListingEditable(owned.status);
  await assertCategoryExists(input.categoryId);

  const images = input.images;
  const documents = await validateListingDocumentsForUser(
    sellerId,
    input.documents ?? [],
  );

  await updateListingDraft({
    sellerId,
    listingId,
    data: {
      ...input,
      images,
      documents,
    },
  });

  return transitionListingStatus({
    listingId,
    toStatus: ListingStatus.SUBMITTED,
    actorId: sellerId,
    notes: "Submitted by seller for review.",
  });
}
