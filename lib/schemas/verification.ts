import { z } from "zod";

export const VERIFICATION_EVIDENCE_MAX_COUNT = 10;
export const VERIFICATION_EVIDENCE_MAX_BYTES = 10 * 1024 * 1024;

export const verificationEvidenceSchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1).max(255),
});

export const verificationApplicationSchema = z.object({
  applicationNotes: z
    .string()
    .trim()
    .min(20, "Please describe why you are requesting verification.")
    .max(4000),
  evidenceSummary: z
    .string()
    .trim()
    .min(20, "Please summarise the evidence you are providing.")
    .max(4000),
  evidenceUrls: z
    .array(verificationEvidenceSchema)
    .min(1, "Please upload at least one piece of evidence.")
    .max(VERIFICATION_EVIDENCE_MAX_COUNT),
});

export type VerificationEvidenceInput = z.infer<
  typeof verificationEvidenceSchema
>;
export type VerificationApplicationInput = z.infer<
  typeof verificationApplicationSchema
>;

export const adminVerificationActionSchema = z.object({
  applicationId: z.string().trim().min(1),
  action: z.enum(["approve", "reject", "revoke"]),
  reason: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type AdminVerificationActionInput = z.infer<
  typeof adminVerificationActionSchema
>;
