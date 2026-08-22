import { prisma } from "@/lib/prisma";

import { toStreamChannelId } from "./channelId";
import { getStreamServerClient } from "./config";
import { upsertStreamUsers } from "./users";

type DirectChannelInput = {
  threadId: string;
  memberIds: [string, string];
  members: Array<{
    id: string;
    name: string | null;
    image: string | null;
  }>;
};

export async function ensureDirectMessageChannel({
  threadId,
  memberIds,
  members,
}: DirectChannelInput) {
  const client = getStreamServerClient();
  await upsertStreamUsers(members);

  const channelId = toStreamChannelId(threadId);
  const channel = client.channel("messaging", channelId, {
    members: memberIds,
    created_by_id: memberIds[0],
  });

  try {
    await channel.create();
  } catch {
    // Channel already exists — continue with backfill/watch setup.
  }

  await backfillChannelHistory(threadId, channel);

  return channel;
}

async function backfillChannelHistory(
  threadId: string,
  channel: Awaited<ReturnType<typeof ensureDirectMessageChannel>>,
) {
  const existing = await channel.query({ messages: { limit: 1 } });
  if (existing.messages.length > 0) {
    return;
  }

  const dbMessages = await prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    select: {
      body: true,
      senderId: true,
      createdAt: true,
    },
  });

  for (const message of dbMessages) {
    await channel.sendMessage({
      text: message.body,
      user_id: message.senderId,
    });
  }
}
