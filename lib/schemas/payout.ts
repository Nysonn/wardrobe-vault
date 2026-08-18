import { z } from "zod";

export const adminPayoutActionSchema = z.object({
  payoutId: z.string().trim().min(1),
  action: z.enum([
    "approve",
    "process",
    "mark-paid",
    "hold",
    "release",
    "fail",
  ]),
  notes: z.string().trim().max(2000).optional(),
  failureReason: z.string().trim().max(1000).optional(),
});

export type AdminPayoutActionInput = z.infer<typeof adminPayoutActionSchema>;
