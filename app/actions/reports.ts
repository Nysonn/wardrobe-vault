"use server";

import { requireAuth } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import { ReportReason } from "@/lib/generated/prisma/enums";
import { reportListingInputSchema } from "@/lib/schemas/report";
import {
  ReportServiceError,
  reportListing,
} from "@/lib/services/reports/create";

export type ReportListingActionState = {
  error?: string;
  success?: boolean;
};

export async function reportListingAction(
  _prevState: ReportListingActionState,
  formData: FormData,
): Promise<ReportListingActionState> {
  const session = await requireAuth();

  const listingId = formData.get("listingId");
  const reason = formData.get("reason");
  const details = formData.get("details");

  const parsed = reportListingInputSchema.safeParse({
    listingId: typeof listingId === "string" ? listingId : "",
    reason: typeof reason === "string" ? reason : "",
    details:
      typeof details === "string" && details.trim().length > 0
        ? details.trim()
        : undefined,
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check your report details."),
    };
  }

  if (!Object.values(ReportReason).includes(parsed.data.reason)) {
    return { error: "Choose a valid reason for your report." };
  }

  try {
    await reportListing({
      reporterId: session.user.id,
      data: parsed.data,
    });
    return { success: true };
  } catch (error) {
    return resolveActionError(error, {
      context: "reports.create",
      serviceErrors: [ReportServiceError],
      fallback: "Something went wrong while submitting your report. Please try again.",
    });
  }
}
