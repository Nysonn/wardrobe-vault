"use client";

import { useState, useTransition } from "react";

import { adminTransitionOrderAction } from "@/app/actions/admin/orders";
import { Button } from "@/components/ui/button";
import type { AdminOrderActionState } from "@/lib/types/admin-order";
import { OrderStatus } from "@/lib/generated/prisma/enums";

type TransitionOption = {
  status: OrderStatus;
  label: string;
  variant?: "default" | "outline" | "destructive";
};

type Props = {
  orderId: string;
  transitions: TransitionOption[];
};

export function OrderActionPanel({ orderId, transitions }: Props) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AdminOrderActionState>({});

  function handleTransition(toStatus: OrderStatus) {
    setState({});
    startTransition(async () => {
      const result = await adminTransitionOrderAction(orderId, toStatus);
      setState(result);
    });
  }

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No fulfillment actions available for this status.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Fulfillment actions
      </h3>
      <div className="flex flex-wrap gap-2">
        {transitions.map((transition) => (
          <Button
            key={transition.status}
            type="button"
            size="sm"
            variant={transition.variant ?? "outline"}
            disabled={pending}
            onClick={() => handleTransition(transition.status)}
          >
            {transition.label}
          </Button>
        ))}
      </div>
      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Order status updated.
        </p>
      ) : null}
    </div>
  );
}
