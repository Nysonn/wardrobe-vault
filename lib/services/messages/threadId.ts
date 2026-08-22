/** Deterministic thread id for a pair of users (order-independent). */
export function buildThreadId(userA: string, userB: string): string {
  const [first, second] = [userA, userB].sort();
  return `${first}:${second}`;
}

export function getOtherParticipant(
  threadId: string,
  currentUserId: string,
): string | null {
  const [first, second] = threadId.split(":");
  if (!first || !second) return null;
  if (currentUserId === first) return second;
  if (currentUserId === second) return first;
  return null;
}

export function isParticipant(threadId: string, userId: string): boolean {
  return getOtherParticipant(threadId, userId) !== null;
}
