import { StreamChat } from "stream-chat";

export class StreamChatConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StreamChatConfigError";
  }
}

export function getStreamChatApiKey(): string {
  const apiKey =
    process.env.STREAM_CHAT_API_KEY ??
    process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY;

  if (!apiKey) {
    throw new StreamChatConfigError(
      "STREAM_CHAT_API_KEY is not configured.",
    );
  }

  return apiKey;
}

export function getStreamChatApiSecret(): string {
  const apiSecret = process.env.STREAM_CHAT_API_SECRET;

  if (!apiSecret) {
    throw new StreamChatConfigError(
      "STREAM_CHAT_API_SECRET is not configured.",
    );
  }

  return apiSecret;
}

/** Server-side Stream client — never expose the secret to the browser. */
export function getStreamServerClient() {
  return StreamChat.getInstance(getStreamChatApiKey(), getStreamChatApiSecret());
}

export function isStreamChatConfigured(): boolean {
  return Boolean(
    (process.env.STREAM_CHAT_API_KEY ??
      process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY) &&
      process.env.STREAM_CHAT_API_SECRET,
  );
}
