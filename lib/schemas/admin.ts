import { z } from "zod";

export const adminUserSuspendSchema = z.object({
  userId: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(10, "Please provide a reason for suspension.")
    .max(1000),
});

export const adminUserUnsuspendSchema = z.object({
  userId: z.string().min(1),
});

export const adminCategoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
});

export const adminCategoryUpdateSchema = adminCategoryCreateSchema.extend({
  categoryId: z.string().min(1),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export const adminReportActionSchema = z.object({
  reportId: z.string().min(1),
  action: z.enum(["under-review", "resolve", "dismiss"]),
  resolutionNotes: z.string().trim().max(2000).optional(),
});

export const adminMarketplaceSettingsSchema = z.object({
  verificationPolicy: z.string().trim().min(20).max(8000),
  shippingGuidance: z.string().trim().min(20).max(8000),
});
