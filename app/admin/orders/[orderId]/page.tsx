import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderActionPanel } from "@/components/admin/order-action-panel";
import { Badge } from "@/components/ui/badge";
import { formatUgx } from "@/lib/format/currency";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import { getAdminOrderDetail } from "@/lib/services/admin/orders";
import {
  canTransitionOrder,
} from "@/lib/services/orders/stateMachine";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.ORDER_PLACED]: "Order placed",
  [OrderStatus.PAYMENT_CONFIRMED]: "Payment confirmed",
  [OrderStatus.AWAITING_SELLER]: "Awaiting seller",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.IN_TRANSIT]: "In transit",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.COMPLETED]: "Completed",
  [OrderStatus.DISPUTED]: "Disputed",
  [OrderStatus.CANCELLED]: "Cancelled",
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await getAdminOrderDetail(orderId);

  if (!order) {
    notFound();
  }

  const item = order.items[0];

  const transitionLabels: Partial<
    Record<OrderStatus, { label: string; variant?: "default" | "outline" | "destructive" }>
  > = {
    [OrderStatus.SHIPPED]: { label: "Mark shipped" },
    [OrderStatus.IN_TRANSIT]: { label: "Mark in transit" },
    [OrderStatus.DELIVERED]: { label: "Mark delivered" },
    [OrderStatus.COMPLETED]: { label: "Mark completed" },
    [OrderStatus.DISPUTED]: { label: "Mark disputed", variant: "destructive" },
    [OrderStatus.CANCELLED]: { label: "Cancel order", variant: "destructive" },
  };

  const availableTransitions = (
    Object.entries(transitionLabels) as [
      OrderStatus,
      { label: string; variant?: "default" | "outline" | "destructive" },
    ][]
  )
    .filter(([toStatus]) => canTransitionOrder(order.status, toStatus))
    .map(([status, config]) => ({
      status,
      label: config.label,
      variant: config.variant,
    }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/orders"
          className="text-xs uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Orders
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              {order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {item?.titleSnapshot ?? "Order detail"}
            </p>
          </div>
          <Badge variant="secondary">{STATUS_LABELS[order.status]}</Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Buyer</dt>
                <dd>{order.buyer.name ?? order.buyer.email}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Seller</dt>
                <dd>{order.seller.name ?? order.seller.email}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Placed</dt>
                <dd>{formatDate(order.placedAt)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Payment</dt>
                <dd>{order.paymentStatus}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Item price</dt>
                <dd>{formatUgx(order.itemPrice)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Commission</dt>
                <dd>{formatUgx(order.commissionAmount)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Shipping</dt>
                <dd>
                  {order.shippingFee > 0
                    ? formatUgx(order.shippingFee)
                    : "Included"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Total paid</dt>
                <dd>{formatUgx(order.totalAmount)}</dd>
              </div>
            </dl>
          </section>

          {order.payout ? (
            <section className="rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Seller payout
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {formatUgx(order.payout.netAmount)} · {order.payout.status}
              </p>
              <Link
                href={`/admin/payouts/${order.payout.id}`}
                className="mt-2 inline-block text-sm underline-offset-4 hover:underline"
              >
                View payout
              </Link>
            </section>
          ) : null}
        </div>

        <OrderActionPanel
          orderId={order.id}
          transitions={availableTransitions}
        />
      </div>
    </div>
  );
}
