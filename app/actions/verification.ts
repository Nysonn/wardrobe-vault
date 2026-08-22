"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import {
  verificationApplicationSchema,
  type VerificationEvidenceInput,
} from "@/lib/schemas/verification";
import {
  submitVerificationApplication,
  VerificationServiceError,
} from "@/lib/services/verification";

export type VerificationActionState = {
  error?: string;
  success?: boolean;
};

function parseEvidenceUrls(raw: FormDataEntryValue | null): VerificationEvidenceInput[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];

  try {
    return JSON.parse(raw) as VerificationEvidenceInput[];
  } catch {
    return [];
  }
}

export async function submitVerificationApplicationAction(
  _prevState: VerificationActionState,
  formData: FormData,
): Promise<VerificationActionState> {
  const session = await requireAuth();

  const parsed = verificationApplicationSchema.safeParse({
    applicationNotes: formData.get("applicationNotes"),
    evidenceSummary: formData.get("evidenceSummary"),
    evidenceUrls: parseEvidenceUrls(formData.get("evidenceUrls")),
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check your application."),
    };
  }

  try {
    await submitVerificationApplication(session.user.id, parsed.data);
  } catch (error) {
    return resolveActionError(error, {
      context: "verification.submit",
      serviceErrors: [VerificationServiceError],
      fallback:
        "Something went wrong while submitting your application. Please try again.",
    });
  }

  revalidatePath("/verify");

  return { success: true };
}
