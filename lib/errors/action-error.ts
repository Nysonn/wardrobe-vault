import * as Sentry from "@sentry/nextjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { ZodError } from "zod";

export const GENERIC_USER_ERROR =
  "Something went wrong. Please try again.";

type ServiceErrorClass = abstract new (...args: never[]) => Error;

type ResolveActionErrorOptions = {
  context: string;
  serviceErrors?: ServiceErrorClass[];
  fallback?: string;
};

/** Prefer a short, human fallback over raw Zod issue text in UI. */
export function validationMessage(
  error: ZodError,
  fallback = "Please check the details you entered.",
) {
  return fallback;
}

/**
 * Map unexpected action failures to human copy and log technical detail to Sentry.
 * Re-throws Next.js redirect/notFound navigation errors unchanged.
 */
export function resolveActionError(
  error: unknown,
  { context, serviceErrors = [], fallback = GENERIC_USER_ERROR }: ResolveActionErrorOptions,
): { error: string } {
  if (isRedirectError(error)) {
    throw error;
  }

  for (const ServiceError of serviceErrors) {
    if (error instanceof ServiceError) {
      return { error: error.message };
    }
  }

  Sentry.captureException(error, { tags: { action: context } });
  return { error: fallback };
}
