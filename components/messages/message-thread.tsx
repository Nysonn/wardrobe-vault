"use client";

import { useEffect, useRef, useState } from "react";
import type { Channel, Event, StreamChat } from "stream-chat";

import {
  sendMessageAction,
  type MessageActionState,
} from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toStreamChannelId } from "@/lib/stream/channelId";
import { cn } from "@/lib/utils";

type ThreadMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string | null;
  isOwn: boolean;
};

type MessageComposerProps = {
  recipientId: string;
  orderId?: string;
  listingId?: string;
  onSent?: () => void;
};

export function MessageComposer({
  recipientId,
  orderId,
  listingId,
  onSent,
}: MessageComposerProps) {
  const [state, setState] = useState<MessageActionState>({});
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setState({});

    const result = await sendMessageAction({}, formData);
    setState(result);
    setPending(false);

    if (result.success) {
      formRef.current?.reset();
      onSent?.();
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <input type="hidden" name="recipientId" value={recipientId} />
      {orderId ? <input type="hidden" name="orderId" value={orderId} /> : null}
      {listingId ? (
        <input type="hidden" name="listingId" value={listingId} />
      ) : null}

      <Textarea
        name="body"
        placeholder="Write your message…"
        rows={3}
        required
        disabled={pending}
      />

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

type StreamMessageThreadProps = {
  threadId: string;
  currentUserId: string;
  otherUserId: string;
  initialMessages: ThreadMessage[];
};

type StreamMessageLike = {
  id: string;
  text?: string | null;
  created_at?: string | Date | null;
  user?: { id?: string; name?: string | null } | null;
};

function mapStreamMessage(
  message: StreamMessageLike,
  currentUserId: string,
): ThreadMessage {
  const createdAtRaw = message.created_at;
  const createdAt =
    createdAtRaw instanceof Date
      ? createdAtRaw.toISOString()
      : typeof createdAtRaw === "string"
        ? createdAtRaw
        : new Date().toISOString();

  return {
    id: message.id,
    body: message.text ?? "",
    createdAt,
    senderId: message.user?.id ?? "",
    senderName: message.user?.name ?? null,
    isOwn: message.user?.id === currentUserId,
  };
}

export function StreamMessageThread({
  threadId,
  currentUserId,
  otherUserId,
  initialMessages,
}: StreamMessageThreadProps) {
  const [messages, setMessages] =
    useState<ThreadMessage[]>(initialMessages);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<Channel | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    let client: StreamChat | null = null;

    async function connect() {
      try {
        const response = await fetch("/api/stream/token", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Could not connect to messaging.");
        }

        const payload = (await response.json()) as {
          apiKey: string;
          token: string;
          user: { id: string; name: string; image?: string };
        };

        const { StreamChat: StreamChatClient } = await import("stream-chat");
        client = StreamChatClient.getInstance(payload.apiKey);
        clientRef.current = client;

        await client.connectUser(payload.user, async () => {
          const refresh = await fetch("/api/stream/token", { cache: "no-store" });
          if (!refresh.ok) {
            throw new Error("Could not refresh messaging session.");
          }
          const next = (await refresh.json()) as { token: string };
          return next.token;
        });

        if (cancelled) {
          return;
        }

        const channel = client.channel(
          "messaging",
          toStreamChannelId(threadId),
          { members: [currentUserId, otherUserId] },
        );

        await channel.watch();
        channelRef.current = channel;

        setMessages(
          channel.state.messages.map((message) =>
            mapStreamMessage(message, currentUserId),
          ),
        );
        setReady(true);
        setConnectionError(null);

        const onMessage = (event: Event) => {
          if (!event.message) {
            return;
          }

          setMessages((current) => {
            const next = mapStreamMessage(event.message!, currentUserId);
            if (current.some((item) => item.id === next.id)) {
              return current;
            }
            return [...current, next];
          });
        };

        channel.on("message.new", onMessage);

        return () => {
          channel.off("message.new", onMessage);
        };
      } catch (error) {
        if (!cancelled) {
          setConnectionError(
            error instanceof Error
              ? error.message
              : "Live messaging is unavailable.",
          );
        }
      }
    }

    const cleanupPromise = connect();

    return () => {
      cancelled = true;
      void cleanupPromise.then((unsubscribe) => unsubscribe?.());
      channelRef.current = null;
      if (client) {
        void client.disconnectUser();
      }
      clientRef.current = null;
    };
  }, [threadId, currentUserId, otherUserId]);

  return (
    <div className="space-y-3">
      {connectionError ? (
        <p className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {connectionError} Showing saved messages; new replies may take a
          moment to appear.
        </p>
      ) : null}

      <div className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto border border-border bg-muted/20 p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%]",
                message.isOwn ? "ml-auto text-right" : "mr-auto text-left",
              )}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {message.isOwn ? "You" : (message.senderName ?? "Contact")}
              </p>
              <p
                className={cn(
                  "mt-1 whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed",
                  message.isOwn
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-foreground",
                )}
              >
                {message.body}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(message.createdAt))}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {!ready && !connectionError ? (
        <p className="text-xs text-muted-foreground">Connecting to live chat…</p>
      ) : null}
    </div>
  );
}
