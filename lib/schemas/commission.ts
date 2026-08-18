import { z } from "zod";

import { CommissionSettingType } from "@/lib/generated/prisma/enums";

export const commissionSettingCreateSchema = z.object({
  type: z.nativeEnum(CommissionSettingType),
  name: z.string().trim().min(1, "Name is required.").max(120),
  ratePercent: z.coerce
    .number()
    .min(0, "Rate cannot be negative.")
    .max(100, "Rate cannot exceed 100%."),
  description: z.string().trim().max(500).optional(),
  sellerId: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  validFrom: z.string().trim().optional(),
  validUntil: z.string().trim().optional(),
});

export const commissionSettingUpdateSchema = z.object({
  settingId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120).optional(),
  ratePercent: z.coerce.number().min(0).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CommissionSettingCreateInput = z.infer<
  typeof commissionSettingCreateSchema
>;

export type CommissionSettingUpdateInput = z.infer<
  typeof commissionSettingUpdateSchema
>;

export function percentToBps(percent: number) {
  return Math.round(percent * 100);
}

export function bpsToPercentLabel(rateBps: number) {
  const percent = rateBps / 100;
  return percent % 1 === 0 ? `${percent}%` : `${percent.toFixed(2)}%`;
}
