"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import {
  commissionSettingCreateSchema,
  commissionSettingUpdateSchema,
  percentToBps,
} from "@/lib/schemas/commission";
import {
  AdminCommissionError,
  createCommissionSetting,
  updateCommissionSetting,
} from "@/lib/services/admin/commission";

export type AdminCommissionActionState = {
  error?: string;
  success?: boolean;
};

export async function createCommissionSettingAction(
  _prevState: AdminCommissionActionState,
  formData: FormData,
): Promise<AdminCommissionActionState> {
  const session = await requireAdmin();

  const parsed = commissionSettingCreateSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    ratePercent: formData.get("ratePercent"),
    description: formData.get("description") || undefined,
    sellerId: formData.get("sellerId") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    validFrom: formData.get("validFrom") || undefined,
    validUntil: formData.get("validUntil") || undefined,
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the commission setting."),
    };
  }

  const data = parsed.data;

  try {
    await createCommissionSetting({
      adminId: session.user.id,
      type: data.type,
      name: data.name,
      rateBps: percentToBps(data.ratePercent),
      description: data.description,
      sellerId: data.sellerId,
      categoryId: data.categoryId,
      validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.commission.create",
      serviceErrors: [AdminCommissionError],
    });
  }

  revalidatePath("/admin/settings/commission");

  return { success: true };
}

export async function updateCommissionSettingAction(
  _prevState: AdminCommissionActionState,
  formData: FormData,
): Promise<AdminCommissionActionState> {
  const session = await requireAdmin();

  const parsed = commissionSettingUpdateSchema.safeParse({
    settingId: formData.get("settingId"),
    name: formData.get("name") || undefined,
    ratePercent: formData.get("ratePercent") || undefined,
    description: formData.get("description") || undefined,
    isActive: formData.get("isActive") === "true" ? true : formData.get("isActive") === "false" ? false : undefined,
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the commission update."),
    };
  }

  const data = parsed.data;

  try {
    await updateCommissionSetting(data.settingId, session.user.id, {
      name: data.name,
      rateBps:
        data.ratePercent !== undefined
          ? percentToBps(data.ratePercent)
          : undefined,
      description: data.description,
      isActive: data.isActive,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.commission.update",
      serviceErrors: [AdminCommissionError],
    });
  }

  revalidatePath("/admin/settings/commission");

  return { success: true };
}
