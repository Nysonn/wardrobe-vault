import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import {
  MessageComposer,
  StreamMessageThread,
} from "@/components/messages/message-thread";
import { requireAuth } from "@/lib/auth/guards";
import { ensureDirectMessageChannel } from "@/lib/stream/channels";
import { isStreamChatConfigured } from "@/lib/stream/config";
import {
  getThreadMessages,
  getThreadParticipant,
  isParticipant,
} from "@/lib/services/messages";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function MessageThreadPage({ params }: PageProps) {
  const session = await requireAuth();
  const { threadId } = await params;

  if (!isParticipant(threadId, session.user.id)) {
    notFound();
  }

  const [messages, otherUser] = await Promise.all([
    getThreadMessages(session.user.id, threadId),
    getThreadParticipant(session.user.id, threadId),
  ]);

  if (!otherUser) {
    notFound();
  }

  if (isStreamChatConfigured()) {
    const memberIds = [session.user.id, otherUser.id].sort() as [string, string];
    await ensureDirectMessageChannel({
      threadId,
      memberIds,
      members: [
        {
          id: session.user.id,
          name: session.user.name ?? null,
          image: session.user.image ?? null,
        },
        {
          id: otherUser.id,
          name: otherUser.name,
          image: otherUser.image,
        },
      ],
    }).catch(() => {
      // Thread page still renders from DB if Stream provisioning fails.
    });
  }

  const initialMessages = messages.map((message) => ({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    senderId: message.senderId,
    senderName: message.sender.name,
    isOwn: message.senderId === session.user.id,
  }));

  return (
    <>
      <div className="border-b border-border py-6">
        <Container>
          <Link
            href="/messages"
            className="text-xs uppercase tracking-[0.16em] text-muted-foreground transition-vault hover:text-foreground"
          >
            ← All messages
          </Link>
          <h1 className="mt-4 font-heading text-3xl">
            {otherUser.name ?? "Conversation"}
          </h1>
        </Container>
      </div>

      <Section spacing="default" className="pt-10">
        <Container>
          <div className="mx-auto max-w-2xl space-y-6">
            <StreamMessageThread
              threadId={threadId}
              currentUserId={session.user.id}
              otherUserId={otherUser.id}
              initialMessages={initialMessages}
            />
            <MessageComposer recipientId={otherUser.id} />
          </div>
        </Container>
      </Section>
    </>
  );
}
