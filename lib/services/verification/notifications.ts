import { NotificationType } from "@/lib/generated/prisma/enums";
import { createNotification } from "@/lib/services/notifications";

/** Called from Phase 10 admin verification decisions. */
export async function notifyVerificationApproved(userId: string) {
  return createNotification({
    userId,
    type: NotificationType.VERIFICATION_APPROVED,
    title: "Verification approved",
    body: "Your public figure verification has been approved. Your profile now reflects verified status.",
    link: "/verify",
  });
}

/** Called from Phase 10 admin verification decisions. */
export async function notifyVerificationRejected(
  userId: string,
  reason?: string,
) {
  return createNotification({
    userId,
    type: NotificationType.VERIFICATION_REJECTED,
    title: "Verification not approved",
    body:
      reason ??
      "We could not approve your verification request with the evidence provided. You may submit a new application.",
    link: "/verify",
  });
}
