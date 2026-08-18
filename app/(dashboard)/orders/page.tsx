import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth/guards";
import { formatUgx } from "@/lib/format/currency";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import { listOrdersForBuyer } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
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

export default async function OrdersPage() {
  const session = await requireAuth();
  const orders = await listOrdersForBuyer(session.user.id);

  return (
    <Section spacing="default" className="pt-10">
      <Container>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          My Vault
        </p>
        <h1 className="mt-2 font-heading text-3xl">Your orders</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Purchases held and fulfilled through Wardrobe Vault.
        </p>

        {orders.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No orders yet"
            description="When you acquire a piece from the Vault, it will appear here with full payment and fulfilment details."
            action={
              <Link
                href="/vault"
                className="text-sm uppercase tracking-[0.14em] text-foreground underline-offset-4 hover:underline"
              >
                Explore the Vault
              </Link>
            }
          />
        ) : (
          <ul className="mt-10 divide-y divide-border border border-border">
            {orders.map((order) => {
              const imageUrl = order.items[0]?.listing.images[0]?.url;
              return (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex flex-wrap items-center gap-4 px-4 py-5 transition-vault hover:bg-muted/30 sm:flex-nowrap"
                  >
                    {imageUrl ? (
                      <div className="size-16 shrink-0 overflow-hidden border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-16 shrink-0 border border-border bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-lg leading-snug">
                        {order.items[0]?.titleSnapshot ?? "Order"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {order.orderNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <span className="font-heading text-base">
                        {formatUgx(order.totalAmount)}
                      </span>
                      <Badge variant="secondary">
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
}
