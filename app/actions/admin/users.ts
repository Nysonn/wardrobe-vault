"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import {
  adminUserSuspendSchema,
  adminUserUnsuspendSchema,
} from "@/lib/schemas/admin";
import {
  AdminUserError,
  suspendUser,
  unsuspendUser,
} from "@/lib/services/admin/users";

export type AdminUserActionState = {
  error?: string;
  success?: boolean;
};

export async function suspendUserAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await requireAdmin();

  const parsed = adminUserSuspendSchema.safeParse({
    userId: formData.get("userId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the suspension details."),
    };
  }

  try {
    await suspendUser({
      adminId: session.user.id,
      adminRole: session.user.role,
      userId: parsed.data.userId,
      reason: parsed.data.reason,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.users.suspend",
      serviceErrors: [AdminUserError],
    });
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsed.data.userId}`);

  return { success: true };
}

export async function unsuspendUserAction(
  userId: string,
): Promise<AdminUserActionState> {
  const session = await requireAdmin();

  const parsed = adminUserUnsuspendSchema.safeParse({ userId });
  if (!parsed.success) {
    return { error: validationMessage(parsed.error, "Please check the request.") };
  }

  try {
    await unsuspendUser({
      adminId: session.user.id,
      adminRole: session.user.role,
      userId: parsed.data.userId,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.users.unsuspend",
      serviceErrors: [AdminUserError],
    });
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}
