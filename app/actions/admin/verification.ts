"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import { adminVerificationActionSchema } from "@/lib/schemas/verification";
import {
  AdminVerificationError,
  performAdminVerificationAction,
  type AdminVerificationAction,
} from "@/lib/services/admin/verification";

export type AdminVerificationActionState = {
  error?: string;
  success?: boolean;
};

export async function adminVerificationActionAction(
  _prevState: AdminVerificationActionState,
  formData: FormData,
): Promise<AdminVerificationActionState> {
  const session = await requireAdmin();

  const parsed = adminVerificationActionSchema.safeParse({
    applicationId: formData.get("applicationId"),
    action: formData.get("action"),
    reason: formData.get("reason") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the verification action."),
    };
  }

  try {
    await performAdminVerificationAction({
      adminId: session.user.id,
      applicationId: parsed.data.applicationId,
      action: parsed.data.action as AdminVerificationAction,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.verification.action",
      serviceErrors: [AdminVerificationError],
    });
  }

  revalidatePath("/admin/verification");
  revalidatePath(`/admin/verification/${parsed.data.applicationId}`);
  revalidatePath("/verify");

  return { success: true };
}
