"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { adminPayoutActionSchema } from "@/lib/schemas/payout";
import {
  AdminPayoutError,
  transitionPayoutStatus,
} from "@/lib/services/admin/payouts";
import { PayoutServiceError } from "@/lib/services/payouts";

export type AdminPayoutActionState = {
  error?: string;
  success?: boolean;
};

export async function adminPayoutActionAction(
  _prevState: AdminPayoutActionState,
  formData: FormData,
): Promise<AdminPayoutActionState> {
  const session = await requireAdmin();

  const parsed = adminPayoutActionSchema.safeParse({
    payoutId: formData.get("payoutId"),
    action: formData.get("action"),
    notes: formData.get("notes") || undefined,
    failureReason: formData.get("failureReason") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid request.",
    };
  }

  try {
    await transitionPayoutStatus({
      payoutId: parsed.data.payoutId,
      adminId: session.user.id,
      action: parsed.data.action,
      notes: parsed.data.notes,
      failureReason: parsed.data.failureReason,
    });
  } catch (error) {
    if (
      error instanceof AdminPayoutError ||
      error instanceof PayoutServiceError
    ) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/payouts");
  revalidatePath(`/admin/payouts/${parsed.data.payoutId}`);
  revalidatePath("/wallet");

  return { success: true };
}
