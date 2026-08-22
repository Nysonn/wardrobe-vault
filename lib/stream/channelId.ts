const CHANNEL_PREFIX = "dm_";

/** Map app thread ids (`userA:userB`) to Stream-safe channel ids. */
export function toStreamChannelId(threadId: string): string {
  return `${CHANNEL_PREFIX}${threadId.replace(":", "__")}`;
}

export function fromStreamChannelId(channelId: string): string | null {
  if (!channelId.startsWith(CHANNEL_PREFIX)) {
    return null;
  }

  const body = channelId.slice(CHANNEL_PREFIX.length);
  const separator = body.indexOf("__");
  if (separator === -1) {
    return null;
  }

  return `${body.slice(0, separator)}:${body.slice(separator + 2)}`;
}
