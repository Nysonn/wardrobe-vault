import { prisma } from "@/lib/prisma";

import { getOtherParticipant } from "./threadId";

export async function listMessageThreads(userId: string) {
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { recipientId: userId }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      threadId: true,
      body: true,
      createdAt: true,
      readAt: true,
      senderId: true,
      recipientId: true,
      sender: { select: { id: true, name: true, image: true } },
      recipient: { select: { id: true, name: true, image: true } },
    },
  });

  const threads = new Map<
    string,
    {
      threadId: string;
      lastMessage: string;
      lastMessageAt: Date;
      unreadCount: number;
      otherUser: { id: string; name: string | null; image: string | null };
    }
  >();

  for (const message of messages) {
    const existing = threads.get(message.threadId);
    const otherUserId = getOtherParticipant(message.threadId, userId);
    const otherUser =
      message.senderId === userId ? message.recipient : message.sender;

    if (!otherUserId || otherUser.id !== otherUserId) {
      continue;
    }

    const isUnread =
      message.recipientId === userId && message.readAt === null ? 1 : 0;

    if (!existing) {
      threads.set(message.threadId, {
        threadId: message.threadId,
        lastMessage: message.body,
        lastMessageAt: message.createdAt,
        unreadCount: isUnread,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          image: otherUser.image,
        },
      });
      continue;
    }

    existing.unreadCount += isUnread;
  }

  return Array.from(threads.values()).sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime(),
  );
}

export async function getThreadMessages(userId: string, threadId: string) {
  const messages = await prisma.message.findMany({
    where: {
      threadId,
      OR: [{ senderId: userId }, { recipientId: userId }],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      readAt: true,
      senderId: true,
      recipientId: true,
      orderId: true,
      listingId: true,
      sender: { select: { id: true, name: true } },
    },
  });

  if (messages.length === 0) {
    return [];
  }

  await prisma.message.updateMany({
    where: {
      threadId,
      recipientId: userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return messages;
}

export async function getThreadParticipant(
  userId: string,
  threadId: string,
) {
  const otherUserId = getOtherParticipant(threadId, userId);
  if (!otherUserId) return null;

  return prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, name: true, image: true },
  });
}
