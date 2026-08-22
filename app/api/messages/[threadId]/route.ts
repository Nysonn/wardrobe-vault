import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { getThreadMessages, isParticipant } from "@/lib/services/messages";

type RouteContext = {
  params: Promise<{ threadId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await context.params;

  if (!isParticipant(threadId, session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await getThreadMessages(session.user.id, threadId);

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      senderName: message.sender.name,
      isOwn: message.senderId === session.user.id,
    })),
  });
}
