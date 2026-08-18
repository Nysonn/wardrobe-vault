import { PaymentStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { assertPaymentTransition } from "@/lib/services/orders/stateMachine";

import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
  ProcessPaymentInput,
  ProcessPaymentResult,
} from "./types";

function mockReference(orderId: string) {
  return `mock_${orderId}_${Date.now()}`;
}

/**
 * Mock gateway — follows the same PENDING → PROCESSING → CONFIRMED/FAILED
 * lifecycle as a real provider. Never jumps straight to success.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    return {
      providerReference: mockReference(input.orderId),
    };
  }

  async processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
    const payment = await prisma.payment.findUnique({
      where: { id: input.paymentId },
      select: { id: true, status: true, orderId: true },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === PaymentStatus.CONFIRMED) {
      return { status: PaymentStatus.CONFIRMED };
    }

    if (payment.status === PaymentStatus.FAILED) {
      return {
        status: PaymentStatus.FAILED,
        failureReason: "Payment previously failed.",
      };
    }

    const shouldFail =
      input.simulateFailure === true ||
      process.env.MOCK_PAYMENT_FAIL === "true";

    let status = payment.status;

    if (status === PaymentStatus.PENDING) {
      assertPaymentTransition(status, PaymentStatus.PROCESSING);
      status = PaymentStatus.PROCESSING;
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PROCESSING },
      });
    }

    if (status === PaymentStatus.PROCESSING) {
      const nextStatus = shouldFail
        ? PaymentStatus.FAILED
        : PaymentStatus.CONFIRMED;

      assertPaymentTransition(PaymentStatus.PROCESSING, nextStatus);

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          failureReason: shouldFail
            ? "Mock payment declined. No funds were captured."
            : null,
        },
      });

      return {
        status: nextStatus,
        failureReason: shouldFail
          ? "Mock payment declined. No funds were captured."
          : undefined,
      };
    }

    return { status: payment.status };
  }
}
