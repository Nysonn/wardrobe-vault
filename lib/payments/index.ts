import { MockPaymentProvider } from "./mock-provider";
import type { PaymentProvider } from "./types";

let cachedProvider: PaymentProvider | undefined;

export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const useMock = process.env.MOCK_PAYMENTS !== "false";

  if (!useMock) {
    throw new Error(
      "MOCK_PAYMENTS is disabled but no live PaymentProvider is configured.",
    );
  }

  cachedProvider = new MockPaymentProvider();
  return cachedProvider;
}

export type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
  ProcessPaymentInput,
  ProcessPaymentResult,
} from "./types";
