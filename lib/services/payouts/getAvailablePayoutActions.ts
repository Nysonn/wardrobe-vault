import { PayoutStatus } from "@/lib/generated/prisma/enums";

import type { AdminPayoutAction } from "./transitionPayoutStatus";
import { canTransitionPayout } from "./stateMachine";

export type PayoutActionOption = {
  action: AdminPayoutAction;
  label: string;
  variant: "default" | "outline" | "destructive";
  requiresReason?: boolean;
};

const ACTION_CONFIGS: {
  action: AdminPayoutAction;
  label: string;
  toStatus: PayoutStatus;
  variant: "default" | "outline" | "destructive";
  requiresReason?: boolean;
}[] = [
  {
    action: "approve",
    label: "Approve payout",
    toStatus: PayoutStatus.APPROVED,
    variant: "default",
  },
  {
    action: "process",
    label: "Mark processing",
    toStatus: PayoutStatus.PROCESSING,
    variant: "outline",
  },
  {
    action: "mark-paid",
    label: "Complete payout",
    toStatus: PayoutStatus.PAID,
    variant: "default",
  },
  {
    action: "hold",
    label: "Place on hold",
    toStatus: PayoutStatus.ON_HOLD,
    variant: "outline",
  },
  {
    action: "release",
    label: "Release hold",
    toStatus: PayoutStatus.PENDING,
    variant: "outline",
  },
  {
    action: "fail",
    label: "Mark failed",
    toStatus: PayoutStatus.FAILED,
    variant: "destructive",
    requiresReason: true,
  },
];

export function getAvailablePayoutActions(
  currentStatus: PayoutStatus,
): PayoutActionOption[] {
  return ACTION_CONFIGS.filter((config) =>
    canTransitionPayout(currentStatus, config.toStatus),
  ).map(({ action, label, variant, requiresReason }) => ({
    action,
    label,
    variant,
    requiresReason,
  }));
}
