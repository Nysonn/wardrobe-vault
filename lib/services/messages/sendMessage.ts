import { NotificationType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { createNotification } from "@/lib/services/notifications";
import type { SendMessageInput } from "@/lib/schemas/message";

import { MessageServiceError } from "./errors";
import { sendStreamMessage } from "./stream";
import { buildThreadId } from "./threadId";

const MESSAGE_RATE_LIMIT = {
  limit: 30,
  windowMs: 60 * 60 * 1000,
};

export async function sendMessage(senderId: string, input: SendMessageInput) {
  if (senderId === input.recipientId) {
    throw new MessageServiceError("You cannot message yourself.");
  }

  await enforceRateLimit({
    key: `message:${senderId}`,
    ...MESSAGE_RATE_LIMIT,
  });

  const recipient = await prisma.user.findUnique({
    where: { id: input.recipientId },
    select: { id: true, suspendedAt: true, name: true, image: true },
  });

  if (!recipient || recipient.suspendedAt) {
    throw new MessageServiceError("This recipient is not available.");
  }

  if (input.orderId) {
    const order = await prisma.order.findFirst({
      where: {
        id: input.orderId,
        OR: [{ buyerId: senderId }, { sellerId: senderId }],
      },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
      },
    });

    if (!order) {
      throw new MessageServiceError("This order could not be found.");
    }

    const otherParty =
      order.buyerId === senderId ? order.sellerId : order.buyerId;

    if (otherParty !== input.recipientId) {
      throw new MessageServiceError(
        "You can only message the other party on this order.",
      );
    }
  }

  if (input.listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: input.listingId },
      select: { id: true, sellerId: true },
    });

    if (!listing) {
      throw new MessageServiceError("This listing could not be found.");
    }
  }

  const threadId = buildThreadId(senderId, input.recipientId);
  const preview =
    input.body.length > 120 ? `${input.body.slice(0, 117)}…` : input.body;

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { name: true, image: true },
  });

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        threadId,
        senderId,
        recipientId: input.recipientId,
        orderId: input.orderId ?? null,
        listingId: input.listingId ?? null,
        body: input.body,
      },
      select: {
        id: true,
        threadId: true,
        createdAt: true,
      },
    });

    await createNotification(
      {
        userId: input.recipientId,
        type: NotificationType.MESSAGE_RECEIVED,
        title: "New message",
        body: preview,
        link: `/messages/${threadId}`,
        metadata: { senderId, threadId },
      },
      tx,
    );

    return created;
  });

  await sendStreamMessage({
    threadId,
    senderId,
    senderName: sender?.name ?? null,
    senderImage: sender?.image ?? null,
    recipientId: input.recipientId,
    recipientName: recipient.name,
    recipientImage: recipient.image,
    body: input.body,
  }).catch(() => {
    // Stream delivery is best-effort; DB record remains source of truth for notifications.
  });

  return message;
}
