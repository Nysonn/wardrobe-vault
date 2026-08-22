"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import {
  AdminListingError,
  performAdminListingAction,
  type AdminListingAction,
} from "@/lib/services/admin/listings";

export type AdminListingActionState = {
  error?: string;
  success?: boolean;
};

const adminActionSchema = z.object({
  listingId: z.string().trim().min(1),
  action: z.enum([
    "start-review",
    "approve",
    "reject",
    "request-changes",
    "suspend",
    "archive",
    "add-note",
  ]),
  reason: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function adminListingActionAction(
  _prevState: AdminListingActionState,
  formData: FormData,
): Promise<AdminListingActionState> {
  const session = await requireAdmin();

  const parsed = adminActionSchema.safeParse({
    listingId: formData.get("listingId"),
    action: formData.get("action"),
    reason: formData.get("reason") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the action details."),
    };
  }

  try {
    await performAdminListingAction({
      adminId: session.user.id,
      listingId: parsed.data.listingId,
      action: parsed.data.action as AdminListingAction,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.listings.action",
      serviceErrors: [AdminListingError],
    });
  }

  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${parsed.data.listingId}`);

  return { success: true };
}
