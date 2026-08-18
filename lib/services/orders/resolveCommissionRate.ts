import type { Prisma } from "@/lib/generated/prisma/client";
import { CommissionSettingType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type ResolveCommissionRateInput = {
  sellerId: string;
  categoryId: string;
  at?: Date;
  tx?: Prisma.TransactionClient;
};

type CommissionCandidate = {
  type: CommissionSettingType;
  rateBps: number;
};

const TYPE_PRIORITY: Record<CommissionSettingType, number> = {
  [CommissionSettingType.PROMOTIONAL]: 0,
  [CommissionSettingType.SELLER]: 1,
  [CommissionSettingType.CATEGORY]: 2,
  [CommissionSettingType.DEFAULT]: 3,
};

function isWithinValidity(
  setting: {
    validFrom: Date | null;
    validUntil: Date | null;
  },
  at: Date,
) {
  if (setting.validFrom && at < setting.validFrom) {
    return false;
  }
  if (setting.validUntil && at > setting.validUntil) {
    return false;
  }
  return true;
}

function pickBestRate(candidates: CommissionCandidate[]): number | null {
  if (candidates.length === 0) {
    return null;
  }

  const sorted = [...candidates].sort((a, b) => {
    const priorityDiff = TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return a.rateBps - b.rateBps;
  });

  return sorted[0]!.rateBps;
}

/**
 * Resolves the applicable commission rate from admin-configured settings.
 * Priority: promotional → seller → category → default (never hardcoded).
 */
export async function resolveCommissionRate({
  sellerId,
  categoryId,
  at = new Date(),
  tx,
}: ResolveCommissionRateInput): Promise<number> {
  const db = tx ?? prisma;

  const settings = await db.commissionSetting.findMany({
    where: { isActive: true },
    select: {
      type: true,
      rateBps: true,
      sellerId: true,
      categoryId: true,
      validFrom: true,
      validUntil: true,
    },
  });

  const candidates: CommissionCandidate[] = [];

  for (const setting of settings) {
    if (!isWithinValidity(setting, at)) {
      continue;
    }

    switch (setting.type) {
      case CommissionSettingType.PROMOTIONAL:
        candidates.push({ type: setting.type, rateBps: setting.rateBps });
        break;
      case CommissionSettingType.SELLER:
        if (setting.sellerId === sellerId) {
          candidates.push({ type: setting.type, rateBps: setting.rateBps });
        }
        break;
      case CommissionSettingType.CATEGORY:
        if (setting.categoryId === categoryId) {
          candidates.push({ type: setting.type, rateBps: setting.rateBps });
        }
        break;
      case CommissionSettingType.DEFAULT:
        candidates.push({ type: setting.type, rateBps: setting.rateBps });
        break;
      default:
        break;
    }
  }

  const rateBps = pickBestRate(candidates);

  if (rateBps === null) {
    throw new Error(
      "No active commission setting found. Configure a default rate in admin.",
    );
  }

  return rateBps;
}
