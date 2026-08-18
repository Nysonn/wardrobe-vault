import { z } from "zod";

import { ReportReason } from "@/lib/generated/prisma/enums";

const reportReasonSchema = z.enum([
  ReportReason.SUSPECTED_COUNTERFEIT,
  ReportReason.FALSE_CELEBRITY_CLAIM,
  ReportReason.MISLEADING_DESCRIPTION,
  ReportReason.INAPPROPRIATE_CONTENT,
  ReportReason.FRAUD_CONCERN,
  ReportReason.OTHER,
]);

export const reportListingInputSchema = z.object({
  listingId: z.string().trim().min(1, "Listing is required."),
  reason: reportReasonSchema,
  details: z.string().trim().max(2000).optional(),
});

export type ReportListingInput = z.infer<typeof reportListingInputSchema>;

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.SUSPECTED_COUNTERFEIT]: "Suspected counterfeit",
  [ReportReason.FALSE_CELEBRITY_CLAIM]: "False celebrity claim",
  [ReportReason.MISLEADING_DESCRIPTION]: "Misleading description",
  [ReportReason.INAPPROPRIATE_CONTENT]: "Inappropriate content",
  [ReportReason.FRAUD_CONCERN]: "Fraud concern",
  [ReportReason.OTHER]: "Other",
};
