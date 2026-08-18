import type { PaymentStatus } from "@/lib/generated/prisma/enums";

export type InitiatePaymentInput = {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
};

export type InitiatePaymentResult = {
  providerReference: string;
};

export type ProcessPaymentInput = {
  paymentId: string;
  /** Server-only — never accept from client payloads. */
  simulateFailure?: boolean;
};

export type ProcessPaymentResult = {
  status: PaymentStatus;
  failureReason?: string;
};

/**
 * Swappable payment gateway boundary. Order and commission logic must not
 * depend on a concrete provider — only on this interface (tech-spec §1).
 */
export interface PaymentProvider {
  readonly name: string;
  initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult>;
}
