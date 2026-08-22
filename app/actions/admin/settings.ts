"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import { adminMarketplaceSettingsSchema } from "@/lib/schemas/admin";
import {
  AdminSettingsError,
  updatePlatformSettings,
} from "@/lib/services/admin/settings";

export type AdminSettingsActionState = {
  error?: string;
  success?: boolean;
};

export async function updateMarketplaceSettingsAction(
  _prev: AdminSettingsActionState,
  formData: FormData,
): Promise<AdminSettingsActionState> {
  const session = await requireAdmin();

  const parsed = adminMarketplaceSettingsSchema.safeParse({
    verificationPolicy: formData.get("verificationPolicy"),
    shippingGuidance: formData.get("shippingGuidance"),
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the settings you entered."),
    };
  }

  try {
    await updatePlatformSettings({
      adminId: session.user.id,
      ...parsed.data,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.settings.update",
      serviceErrors: [AdminSettingsError],
    });
  }

  revalidatePath("/admin/settings");

  return { success: true };
}
