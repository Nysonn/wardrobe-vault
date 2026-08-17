import { OrderStatus, PaymentStatus } from "@/lib/generated/prisma/client";

/**
 * Allowed order fulfillment status transitions (Phase 1.1).
 * Payment status transitions are tracked separately on `Order.paymentStatus`
 * and the `Payment` record — see PAYMENT_STATUS_TRANSITIONS.
 *
 * Flow reference: initial-prompt.md §22–§23
 */
export const ORDER_STATUS_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  [OrderStatus.ORDER_PLACED]: [
    OrderStatus.PAYMENT_CONFIRMED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PAYMENT_CONFIRMED]: [
    OrderStatus.AWAITING_SELLER,
    OrderStatus.CANCELLED,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.AWAITING_SELLER]: [
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.SHIPPED]: [
    OrderStatus.IN_TRANSIT,
    OrderStatus.DELIVERED,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.IN_TRANSIT]: [
    OrderStatus.DELIVERED,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.DELIVERED]: [
    OrderStatus.COMPLETED,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.DISPUTED]: [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.DELIVERED,
  ],
  [OrderStatus.CANCELLED]: [],
};

/**
 * Mock payment provider status transitions — mirrors a real gateway's
 * pending → processing → confirmed/failed lifecycle (tech-spec §1).
 */
export const PAYMENT_STATUS_TRANSITIONS: Readonly<
  Record<PaymentStatus, readonly PaymentStatus[]>
> = {
  [PaymentStatus.PENDING]: [
    PaymentStatus.PROCESSING,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.PROCESSING]: [
    PaymentStatus.CONFIRMED,
    PaymentStatus.FAILED,
  ],
  [PaymentStatus.CONFIRMED]: [PaymentStatus.REFUNDED],
  [PaymentStatus.FAILED]: [PaymentStatus.PENDING],
  [PaymentStatus.REFUNDED]: [],
  [PaymentStatus.CANCELLED]: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) return true;
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Invalid order status transition: ${from} → ${to}`);
  }
}

export function canTransitionPayment(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  if (from === to) return true;
  return PAYMENT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertPaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Invalid payment status transition: ${from} → ${to}`);
  }
}

/** Terminal fulfillment states — no further shipping progress expected. */
export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];
