import type { ZodError } from "zod";

export class ListingServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ListingServiceError";
  }
}

const LISTING_VALIDATION_MESSAGES: Record<string, string> = {
  shipping: "Shipping details are required before submitting.",
  images: "Check your listing photographs and try again.",
  documents: "Check your supporting documents and try again.",
  categoryId: "Choose a category before submitting.",
  condition: "Choose a condition before submitting.",
  storyDetails: "Share more of the piece's story before submitting.",
};

export function formatListingValidationError(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "Please check your listing details.";
  }

  const pathKey = issue.path[0];
  if (typeof pathKey === "string" && LISTING_VALIDATION_MESSAGES[pathKey]) {
    return LISTING_VALIDATION_MESSAGES[pathKey];
  }

  return issue.message;
}
