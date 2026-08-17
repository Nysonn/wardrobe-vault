import { prisma } from "@/lib/prisma";

export class RateLimitError extends Error {
  constructor(message = "Too many attempts. Please try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

/**
 * Simple DB-backed sliding-window counter for auth endpoints.
 * Fails closed when the database is unavailable.
 */
export async function enforceRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<void> {
  const now = new Date();
  const windowExpiresAt = new Date(now.getTime() + windowMs);

  const existing = await prisma.authRateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowExpiresAt <= now) {
    await prisma.authRateLimit.upsert({
      where: { key },
      create: { key, attemptCount: 1, windowExpiresAt },
      update: { attemptCount: 1, windowExpiresAt },
    });
    return;
  }

  if (existing.attemptCount >= limit) {
    throw new RateLimitError();
  }

  await prisma.authRateLimit.update({
    where: { key },
    data: { attemptCount: { increment: 1 } },
  });
}

export function getClientIp(forwardedFor: string | null): string {
  if (!forwardedFor) return "unknown";
  return forwardedFor.split(",")[0]?.trim() || "unknown";
}
