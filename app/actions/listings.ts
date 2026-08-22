"use server";

import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/guards";
import {
  resolveActionError,
} from "@/lib/errors/action-error";
import {
  createListing,
  updateListingDraft,
  submitListingForReview,
} from "@/lib/services/listings";
import { ListingServiceError } from "@/lib/services/listings/errors";
import type {
  ListingDraftInput,
  ListingImageInput,
  ListingDocumentInput,
  ListingSubmitInput,
  ShippingDetailInput,
} from "@/lib/schemas/listing";

export type ListingActionState = {
  error?: string;
  listingId?: string;
};

const DEFAULT_SHIPPING: ShippingDetailInput = {
  isAvailable: true,
  regions: [],
  fee: 0,
};

function str(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === "string" && val.trim().length > 0
    ? val.trim()
    : undefined;
}

function num(formData: FormData, key: string): number | undefined {
  const val = str(formData, key);
  if (!val) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

function bool(formData: FormData, key: string): boolean | undefined {
  const val = formData.get(key);
  if (val === null) return undefined;
  return val === "true" || val === "on" || val === "1";
}

function parseJsonField<T>(formData: FormData, key: string): T | undefined {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/** Collect all listing fields from FormData. Zod in the service layer validates types. */
function collectListingFields(formData: FormData): ListingDraftInput {
  return {
    title: str(formData, "title"),
    categoryId: str(formData, "categoryId"),
    brand: str(formData, "brand"),
    designer: str(formData, "designer"),
    price: num(formData, "price"),
    size: str(formData, "size"),
    color: str(formData, "color"),
    material: str(formData, "material"),
    condition: str(formData, "condition") as ListingDraftInput["condition"],
    wornByName: str(formData, "wornByName"),
    wornBySeller: bool(formData, "wornBySeller"),
    wornWhere: str(formData, "wornWhere"),
    eventDate: str(formData, "eventDate")
      ? new Date(str(formData, "eventDate")!)
      : undefined,
    eventName: str(formData, "eventName"),
    timesWorn: num(formData, "timesWorn"),
    storyDetails: str(formData, "storyDetails"),
    authenticityNotes: str(formData, "authenticityNotes"),
    images: parseJsonField<ListingImageInput[]>(formData, "images"),
    documents: parseJsonField<ListingDocumentInput[]>(formData, "documents"),
    shipping: parseJsonField<ShippingDetailInput>(formData, "shipping"),
  };
}

function collectSubmitFields(formData: FormData): ListingSubmitInput {
  const fields = collectListingFields(formData);
  return {
    ...fields,
    shipping: fields.shipping ?? DEFAULT_SHIPPING,
    documents: fields.documents ?? [],
  } as ListingSubmitInput;
}

function getListingId(formData: FormData) {
  const listingId = formData.get("listingId");
  return typeof listingId === "string" ? listingId : null;
}

async function withListingErrorHandling<T>(
  action: () => Promise<T>,
): Promise<T | ListingActionState> {
  try {
    return await action();
  } catch (error) {
    return resolveActionError(error, {
      context: "listings.mutation",
      serviceErrors: [ListingServiceError],
      fallback:
        "Something went wrong while saving your listing. Please try again.",
    });
  }
}

export async function createListingAction(
  _prevState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const session = await requireAuth();

  return withListingErrorHandling(async () => {
    const listing = await createListing({
      sellerId: session.user.id,
      data: collectListingFields(formData),
    });
    return { listingId: listing.id };
  });
}

export async function updateListingAction(
  _prevState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const session = await requireAuth();
  const listingId = getListingId(formData);
  if (!listingId) {
    return { error: "Please choose a listing to update." };
  }

  return withListingErrorHandling(async () => {
    await updateListingDraft({
      sellerId: session.user.id,
      listingId,
      data: collectListingFields(formData),
    });
    return { listingId };
  });
}

export async function submitListingAction(
  _prevState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const session = await requireAuth();
  const listingId = getListingId(formData);
  if (!listingId) {
    return { error: "Please choose a listing to submit." };
  }

  return withListingErrorHandling(async () => {
    await submitListingForReview({
      sellerId: session.user.id,
      listingId,
      data: collectSubmitFields(formData),
    });
    redirect("/sell?submitted=1");
  });
}
