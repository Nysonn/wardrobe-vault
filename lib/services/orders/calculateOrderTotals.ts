export type OrderTotalsInput = {
  /** Listing item price in smallest currency unit (UGX shillings). */
  itemPrice: number;
  /** Shipping fee in smallest currency unit. */
  shippingFee: number;
  /** Commission rate in basis points (1000 = 10%). */
  commissionRateBps: number;
};

export type OrderTotals = {
  itemPrice: number;
  shippingFee: number;
  commissionRateBps: number;
  commissionAmount: number;
  /** Amount the buyer pays — item price plus shipping only (§43). */
  buyerTotal: number;
  /** Seller earnings after platform commission. */
  sellerNetEarnings: number;
  /** Platform revenue from commission. */
  platformRevenue: number;
};

/**
 * Single source of truth for order financial breakdown (tech-spec §Gaps.6).
 * Pure function — all inputs must be resolved server-side before calling.
 */
export function calculateOrderTotals(input: OrderTotalsInput): OrderTotals {
  const { itemPrice, shippingFee, commissionRateBps } = input;

  if (!Number.isInteger(itemPrice) || itemPrice < 0) {
    throw new Error("Item price must be a non-negative integer.");
  }

  if (!Number.isInteger(shippingFee) || shippingFee < 0) {
    throw new Error("Shipping fee must be a non-negative integer.");
  }

  if (
    !Number.isInteger(commissionRateBps) ||
    commissionRateBps < 0 ||
    commissionRateBps > 10_000
  ) {
    throw new Error("Commission rate must be between 0 and 10_000 basis points.");
  }

  const commissionAmount = Math.round(
    (itemPrice * commissionRateBps) / 10_000,
  );
  const buyerTotal = itemPrice + shippingFee;
  const sellerNetEarnings = itemPrice - commissionAmount;

  return {
    itemPrice,
    shippingFee,
    commissionRateBps,
    commissionAmount,
    buyerTotal,
    sellerNetEarnings,
    platformRevenue: commissionAmount,
  };
}
