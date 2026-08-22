import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils/slugify";

export class AdminCategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminCategoryError";
  }
}

export async function listAdminCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { listings: true } },
    },
  });
}

type UpsertCategoryInput = {
  adminId: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function createCategory({
  adminId,
  name,
  description,
  sortOrder,
  isActive = true,
}: UpsertCategoryInput) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new AdminCategoryError("Category name is required.");
  }

  const slug = slugify(trimmedName);
  if (!slug) {
    throw new AdminCategoryError("Category name must contain valid characters.");
  }

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: trimmedName }, { slug }],
    },
    select: { id: true },
  });

  if (existing) {
    throw new AdminCategoryError("A category with this name already exists.");
  }

  const category = await prisma.category.create({
    data: {
      name: trimmedName,
      slug,
      description: description?.trim() || null,
      sortOrder: sortOrder ?? 0,
      isActive,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId,
      action: "CATEGORY_CREATED",
      targetType: "Category",
      targetId: category.id,
      details: { name: category.name, slug: category.slug },
    },
  });

  return category;
}

export async function updateCategory(
  categoryId: string,
  adminId: string,
  data: {
    name?: string;
    description?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existing) {
    throw new AdminCategoryError("Category not found.");
  }

  let slug = existing.slug;
  let name = existing.name;

  if (data.name !== undefined) {
    name = data.name.trim();
    if (!name) {
      throw new AdminCategoryError("Category name is required.");
    }
    slug = slugify(name);
    if (!slug) {
      throw new AdminCategoryError("Category name must contain valid characters.");
    }

    const conflict = await prisma.category.findFirst({
      where: {
        id: { not: categoryId },
        OR: [{ name }, { slug }],
      },
      select: { id: true },
    });

    if (conflict) {
      throw new AdminCategoryError("A category with this name already exists.");
    }
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      slug,
      description: data.description,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId,
      action: "CATEGORY_UPDATED",
      targetType: "Category",
      targetId: categoryId,
      details: {
        previousName: existing.name,
        name: updated.name,
        isActive: updated.isActive,
        sortOrder: updated.sortOrder,
      },
    },
  });

  return updated;
}
