import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Generates a human-readable order number (e.g. WV-2026-0042).
 */
export async function generateOrderNumber(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `WV-${year}-`;

  const latest = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let sequence = 1;

  if (latest?.orderNumber) {
    const suffix = latest.orderNumber.slice(prefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (Number.isFinite(parsed)) {
      sequence = parsed + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(4, "0")}`;
}
