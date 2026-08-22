import { ensureDirectMessageChannel } from "@/lib/stream/channels";
import { isStreamChatConfigured } from "@/lib/stream/config";
import { getStreamServerClient } from "@/lib/stream/config";
import { toStreamChannelId } from "@/lib/stream/channelId";

type SendStreamMessageInput = {
  threadId: string;
  senderId: string;
  senderName: string | null;
  senderImage: string | null;
  recipientId: string;
  recipientName: string | null;
  recipientImage: string | null;
  body: string;
};

export async function sendStreamMessage(input: SendStreamMessageInput) {
  if (!isStreamChatConfigured()) {
    return;
  }

  const members = [
    {
      id: input.senderId,
      name: input.senderName,
      image: input.senderImage,
    },
    {
      id: input.recipientId,
      name: input.recipientName,
      image: input.recipientImage,
    },
  ] as const;

  const memberIds = [input.senderId, input.recipientId].sort() as [
    string,
    string,
  ];

  await ensureDirectMessageChannel({
    threadId: input.threadId,
    memberIds,
    members: [...members],
  });

  const client = getStreamServerClient();
  const channel = client.channel(
    "messaging",
    toStreamChannelId(input.threadId),
  );

  await channel.sendMessage({
    text: input.body,
    user_id: input.senderId,
  });
}
