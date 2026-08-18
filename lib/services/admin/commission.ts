import { CommissionSettingType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export class AdminCommissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminCommissionError";
  }
}

export async function getCommissionSettings() {
  return prisma.commissionSetting.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "desc" }],
    include: {
      seller: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function getCommissionFormOptions() {
  const [categories, sellers] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: {
        listings: { some: {} },
      },
      orderBy: { name: "asc" },
      take: 50,
      select: { id: true, name: true, email: true },
    }),
  ]);

  return { categories, sellers };
}

type UpsertCommissionInput = {
  adminId: string;
  type: CommissionSettingType;
  name: string;
  rateBps: number;
  description?: string;
  sellerId?: string;
  categoryId?: string;
  validFrom?: Date;
  validUntil?: Date;
};

function validateCommissionInput(input: UpsertCommissionInput) {
  if (!input.name.trim()) {
    throw new AdminCommissionError("Please provide a name for this rate.");
  }

  if (!Number.isInteger(input.rateBps) || input.rateBps < 0 || input.rateBps > 10_000) {
    throw new AdminCommissionError(
      "Commission rate must be between 0% and 100%.",
    );
  }

  if (input.type === CommissionSettingType.SELLER && !input.sellerId) {
    throw new AdminCommissionError("Seller-specific rates require a seller.");
  }

  if (input.type === CommissionSettingType.CATEGORY && !input.categoryId) {
    throw new AdminCommissionError("Category rates require a category.");
  }

  if (
    input.type === CommissionSettingType.DEFAULT &&
    (input.sellerId || input.categoryId)
  ) {
    throw new AdminCommissionError(
      "Default rates cannot be tied to a seller or category.",
    );
  }
}

export async function createCommissionSetting(input: UpsertCommissionInput) {
  validateCommissionInput(input);

  const setting = await prisma.commissionSetting.create({
    data: {
      type: input.type,
      name: input.name.trim(),
      rateBps: input.rateBps,
      description: input.description?.trim() || null,
      sellerId:
        input.type === CommissionSettingType.SELLER ? input.sellerId : null,
      categoryId:
        input.type === CommissionSettingType.CATEGORY ? input.categoryId : null,
      validFrom: input.validFrom ?? null,
      validUntil: input.validUntil ?? null,
      isActive: true,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId: input.adminId,
      action: "COMMISSION_CREATED",
      targetType: "CommissionSetting",
      targetId: setting.id,
      details: {
        name: setting.name,
        type: setting.type,
        rateBps: setting.rateBps,
      },
    },
  });

  return setting;
}

export async function updateCommissionSetting(
  settingId: string,
  adminId: string,
  data: {
    name?: string;
    rateBps?: number;
    description?: string;
    isActive?: boolean;
    validFrom?: Date | null;
    validUntil?: Date | null;
  },
) {
  const existing = await prisma.commissionSetting.findUnique({
    where: { id: settingId },
  });

  if (!existing) {
    throw new AdminCommissionError("Commission setting not found.");
  }

  if (
    data.rateBps !== undefined &&
    (!Number.isInteger(data.rateBps) ||
      data.rateBps < 0 ||
      data.rateBps > 10_000)
  ) {
    throw new AdminCommissionError(
      "Commission rate must be between 0% and 100%.",
    );
  }

  const updated = await prisma.commissionSetting.update({
    where: { id: settingId },
    data: {
      name: data.name?.trim(),
      rateBps: data.rateBps,
      description: data.description?.trim(),
      isActive: data.isActive,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId,
      action: "COMMISSION_UPDATED",
      targetType: "CommissionSetting",
      targetId: settingId,
      details: {
        name: updated.name,
        type: updated.type,
        previousRateBps: existing.rateBps,
        rateBps: updated.rateBps,
        isActive: updated.isActive,
      },
    },
  });

  return updated;
}
