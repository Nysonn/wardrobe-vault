import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatUgx } from "@/lib/format/currency";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import {
  getAdminOrderQueue,
  getAdminOrderQueueCounts,
  type AdminOrderTab,
} from "@/lib/services/admin/orders";

const TABS: { id: AdminOrderTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "disputed", label: "Disputed" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
];

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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

type SearchParams = Promise<{ tab?: string }>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const validTabs: AdminOrderTab[] = ["active", "disputed", "completed", "all"];
  const activeTab: AdminOrderTab = validTabs.includes(
    params.tab as AdminOrderTab,
  )
    ? (params.tab as AdminOrderTab)
    : "active";

  const [orders, counts] = await Promise.all([
    getAdminOrderQueue(activeTab),
    getAdminOrderQueueCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Orders
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Monitor fulfilment, payment status, and disputes.
        </p>
      </div>

      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 pb-px dark:border-zinc-800 sm:mx-0 sm:px-0">
        {TABS.map((tab) => {
          const count =
            tab.id !== "all"
              ? (counts[tab.id as Exclude<AdminOrderTab, "all">] ?? 0)
              : undefined;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={`/admin/orders?tab=${tab.id}`}
              className={[
                "inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "border-b-2 border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              ].join(" ")}
            >
              {tab.label}
              {count !== undefined && count > 0 ? (
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <EmptyState
          title="This queue is clear."
          description="No orders in this view right now."
        />
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                className="-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {order.orderNumber} ·{" "}
                    {order.items[0]?.titleSnapshot ?? "Order"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {order.buyer.name ?? order.buyer.email} →{" "}
                    {order.seller.name ?? order.seller.email}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant="secondary">
                    {STATUS_LABELS[order.status]}
                  </Badge>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatUgx(order.totalAmount)} · {formatDate(order.placedAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
