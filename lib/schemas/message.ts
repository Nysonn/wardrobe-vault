import { z } from "zod";

export const sendMessageSchema = z.object({
  recipientId: z.string().min(1, "Please choose who to message."),
  body: z
    .string()
    .trim()
    .min(1, "Please write a message.")
    .max(4000, "Messages must be 4,000 characters or fewer."),
  orderId: z.string().optional(),
  listingId: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const threadIdSchema = z.object({
  threadId: z.string().min(1),
});

export type ThreadIdInput = z.infer<typeof threadIdSchema>;
