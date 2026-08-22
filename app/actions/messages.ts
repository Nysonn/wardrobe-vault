"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/guards";
import { RateLimitError } from "@/lib/auth/rate-limit";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import { sendMessageSchema } from "@/lib/schemas/message";
import {
  MessageServiceError,
  sendMessage,
} from "@/lib/services/messages";

export type MessageActionState = {
  error?: string;
  success?: boolean;
};

export async function sendMessageAction(
  _prevState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const session = await requireAuth();

  const raw = {
    recipientId: formData.get("recipientId"),
    body: formData.get("body"),
    orderId: formData.get("orderId") || undefined,
    listingId: formData.get("listingId") || undefined,
  };

  const parsed = sendMessageSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check your message."),
    };
  }

  try {
    const message = await sendMessage(session.user.id, parsed.data);

    revalidatePath("/messages");
    revalidatePath(`/messages/${message.threadId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof MessageServiceError || error instanceof RateLimitError) {
      return { error: error.message };
    }
    return resolveActionError(error, {
      context: "messages.send",
      fallback: "Something went wrong while sending your message. Please try again.",
    });
  }
}
