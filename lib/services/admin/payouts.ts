import { PayoutStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type AdminPayoutTab =
  | "pending"
  | "approved"
  | "processing"
  | "paid"
  | "failed"
  | "on-hold"
  | "all";

export class AdminPayoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminPayoutError";
  }
}

function tabToStatus(tab: AdminPayoutTab): PayoutStatus | null {
  switch (tab) {
    case "pending":
      return PayoutStatus.PENDING;
    case "approved":
      return PayoutStatus.APPROVED;
    case "processing":
      return PayoutStatus.PROCESSING;
    case "paid":
      return PayoutStatus.PAID;
    case "failed":
      return PayoutStatus.FAILED;
    case "on-hold":
      return PayoutStatus.ON_HOLD;
    case "all":
      return null;
    default:
      return PayoutStatus.PENDING;
  }
}

const TAB_KEYS: Exclude<AdminPayoutTab, "all">[] = [
  "pending",
  "approved",
  "processing",
  "paid",
  "failed",
  "on-hold",
];

export async function getAdminPayoutQueueCounts() {
  const counts = await Promise.all(
    TAB_KEYS.map(async (tab) => {
      const status = tabToStatus(tab);
      const count = await prisma.payout.count({
        where: status ? { status } : undefined,
      });
      return [tab, count] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<
    Exclude<AdminPayoutTab, "all">,
    number
  >;
}

export async function getAdminPayoutQueue(tab: AdminPayoutTab) {
  const statusFilter = tabToStatus(tab);

  return prisma.payout.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: [{ createdAt: "asc" }],
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        select: {
          orderNumber: true,
          totalAmount: true,
          shippingFee: true,
          placedAt: true,
          items: {
            take: 1,
            select: { titleSnapshot: true },
          },
        },
      },
    },
  });
}

export async function getAdminPayoutDetail(payoutId: string) {
  return prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          itemPrice: true,
          commissionAmount: true,
          commissionRateBps: true,
          shippingFee: true,
          totalAmount: true,
          payoutStatus: true,
          placedAt: true,
          paidAt: true,
          items: {
            select: {
              titleSnapshot: true,
              price: true,
            },
          },
        },
      },
    },
  });
}

export { transitionPayoutStatus, type AdminPayoutAction } from "@/lib/services/payouts";
