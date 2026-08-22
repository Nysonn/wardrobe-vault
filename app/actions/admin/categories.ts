"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import {
  adminCategoryCreateSchema,
  adminCategoryUpdateSchema,
} from "@/lib/schemas/admin";
import {
  AdminCategoryError,
  createCategory,
  updateCategory,
} from "@/lib/services/admin/categories";

export type AdminCategoryActionState = {
  error?: string;
  success?: boolean;
};

export async function createCategoryAction(
  _prev: AdminCategoryActionState,
  formData: FormData,
): Promise<AdminCategoryActionState> {
  const session = await requireAdmin();

  const parsed = adminCategoryCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder") || undefined,
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the category details."),
    };
  }

  try {
    await createCategory({
      adminId: session.user.id,
      ...parsed.data,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.categories.create",
      serviceErrors: [AdminCategoryError],
    });
  }

  revalidatePath("/admin/categories");

  return { success: true };
}

export async function updateCategoryAction(
  _prev: AdminCategoryActionState,
  formData: FormData,
): Promise<AdminCategoryActionState> {
  const session = await requireAdmin();

  const parsed = adminCategoryUpdateSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder") || undefined,
    isActive: formData.get("isActive") || undefined,
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the category details."),
    };
  }

  try {
    await updateCategory(parsed.data.categoryId, session.user.id, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.categories.update",
      serviceErrors: [AdminCategoryError],
    });
  }

  revalidatePath("/admin/categories");

  return { success: true };
}
