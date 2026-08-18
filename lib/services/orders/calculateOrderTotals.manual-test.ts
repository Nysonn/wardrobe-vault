/**
 * Manual verification cases for calculateOrderTotals() (tech-spec §Gaps.6).
 *
 * Run: npx tsx lib/services/orders/calculateOrderTotals.manual-test.ts
 */
import { calculateOrderTotals } from "./calculateOrderTotals";

type ManualTestCase = {
  name: string;
  input: Parameters<typeof calculateOrderTotals>[0];
  expected: ReturnType<typeof calculateOrderTotals>;
};

export const MANUAL_ORDER_TOTALS_TEST_CASES: ManualTestCase[] = [
  {
    name: "Standard 10% commission with shipping (seed order 1 parity)",
    input: {
      itemPrice: 6_000_000,
      shippingFee: 100_000,
      commissionRateBps: 1000,
    },
    expected: {
      itemPrice: 6_000_000,
      shippingFee: 100_000,
      commissionRateBps: 1000,
      commissionAmount: 600_000,
      buyerTotal: 6_100_000,
      sellerNetEarnings: 5_400_000,
      platformRevenue: 600_000,
    },
  },
  {
    name: "Promotional 0% commission",
    input: {
      itemPrice: 4_200_000,
      shippingFee: 85_000,
      commissionRateBps: 0,
    },
    expected: {
      itemPrice: 4_200_000,
      shippingFee: 85_000,
      commissionRateBps: 0,
      commissionAmount: 0,
      buyerTotal: 4_285_000,
      sellerNetEarnings: 4_200_000,
      platformRevenue: 0,
    },
  },
  {
    name: "Seller-specific 15% commission",
    input: {
      itemPrice: 2_200_000,
      shippingFee: 40_000,
      commissionRateBps: 1500,
    },
    expected: {
      itemPrice: 2_200_000,
      shippingFee: 40_000,
      commissionRateBps: 1500,
      commissionAmount: 330_000,
      buyerTotal: 2_240_000,
      sellerNetEarnings: 1_870_000,
      platformRevenue: 330_000,
    },
  },
  {
    name: "Category rate 12.5% with rounding",
    input: {
      itemPrice: 999_999,
      shippingFee: 25_000,
      commissionRateBps: 1250,
    },
    expected: {
      itemPrice: 999_999,
      shippingFee: 25_000,
      commissionRateBps: 1250,
      commissionAmount: 125_000,
      buyerTotal: 1_024_999,
      sellerNetEarnings: 874_999,
      platformRevenue: 125_000,
    },
  },
  {
    name: "Free shipping edge case",
    input: {
      itemPrice: 950_000,
      shippingFee: 0,
      commissionRateBps: 1000,
    },
    expected: {
      itemPrice: 950_000,
      shippingFee: 0,
      commissionRateBps: 1000,
      commissionAmount: 95_000,
      buyerTotal: 950_000,
      sellerNetEarnings: 855_000,
      platformRevenue: 95_000,
    },
  },
  {
    name: "Minimum item price (1 UGX)",
    input: {
      itemPrice: 1,
      shippingFee: 0,
      commissionRateBps: 1000,
    },
    expected: {
      itemPrice: 1,
      shippingFee: 0,
      commissionRateBps: 1000,
      commissionAmount: 0,
      buyerTotal: 1,
      sellerNetEarnings: 1,
      platformRevenue: 0,
    },
  },
];

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function runManualOrderTotalsTests(): {
  passed: number;
  failed: number;
  failures: string[];
} {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const testCase of MANUAL_ORDER_TOTALS_TEST_CASES) {
    const actual = calculateOrderTotals(testCase.input);

    if (deepEqual(actual, testCase.expected)) {
      passed += 1;
    } else {
      failed += 1;
      failures.push(
        `${testCase.name}\n  expected: ${JSON.stringify(testCase.expected)}\n  actual:   ${JSON.stringify(actual)}`,
      );
    }
  }

  return { passed, failed, failures };
}

if (process.argv[1]?.includes("calculateOrderTotals.manual-test")) {
  const result = runManualOrderTotalsTests();

  if (result.failed === 0) {
    console.log(`All ${result.passed} calculateOrderTotals manual tests passed.`);
    process.exit(0);
  }

  console.error(
    `${result.failed} of ${result.passed + result.failed} manual tests failed:`,
  );
  for (const failure of result.failures) {
    console.error(`\n${failure}`);
  }
  process.exit(1);
}
