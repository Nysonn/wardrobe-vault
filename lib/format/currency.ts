const UGX_FORMATTER = new Intl.NumberFormat("en-UG", {
  style: "currency",
  currency: "UGX",
  maximumFractionDigits: 0,
});

export function formatUgx(amount: number) {
  return UGX_FORMATTER.format(amount);
}
