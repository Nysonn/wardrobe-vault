import { PayoutStatus } from "@/lib/generated/prisma/enums";

/**
 * Seller payout status transitions (Phase 1.1).
 * Only platform/admin actions may advance payout status — never the seller
 * (AGENTS.md §2, initial-prompt.md §20).
 */
export const PAYOUT_STATUS_TRANSITIONS: Readonly<
  Record<PayoutStatus, readonly PayoutStatus[]>
> = {
  [PayoutStatus.PENDING]: [
    PayoutStatus.APPROVED,
    PayoutStatus.ON_HOLD,
    PayoutStatus.FAILED,
  ],
  [PayoutStatus.APPROVED]: [
    PayoutStatus.PROCESSING,
    PayoutStatus.ON_HOLD,
    PayoutStatus.FAILED,
  ],
  [PayoutStatus.PROCESSING]: [
    PayoutStatus.PAID,
    PayoutStatus.FAILED,
    PayoutStatus.ON_HOLD,
  ],
  [PayoutStatus.PAID]: [],
  [PayoutStatus.FAILED]: [
    PayoutStatus.PENDING,
    PayoutStatus.ON_HOLD,
  ],
  [PayoutStatus.ON_HOLD]: [
    PayoutStatus.PENDING,
    PayoutStatus.APPROVED,
    PayoutStatus.FAILED,
  ],
};

export function canTransitionPayout(
  from: PayoutStatus,
  to: PayoutStatus,
): boolean {
  if (from === to) return true;
  return PAYOUT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertPayoutTransition(
  from: PayoutStatus,
  to: PayoutStatus,
): void {
  if (!canTransitionPayout(from, to)) {
    throw new Error(`Invalid payout status transition: ${from} → ${to}`);
  }
}
