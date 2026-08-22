import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/guards";
import { formatUgx } from "@/lib/format/currency";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import { getOrderForBuyer } from "@/lib/services/orders";
import { buildThreadId } from "@/lib/services/messages";

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

type PageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ confirmed?: string }>;
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: PageProps) {
  const session = await requireAuth();
  const { orderId } = await params;
  const { confirmed } = await searchParams;

  const order = await getOrderForBuyer(orderId, session.user.id);

  if (!order) {
    notFound();
  }

  const item = order.items[0];
  const imageUrl = item?.listing.images[0]?.url;
  const messageThreadId = buildThreadId(session.user.id, order.seller.id);

  return (
    <>
      <div className="border-b border-border py-6">
        <Container>
          <Link
            href="/orders"
            className="text-xs uppercase tracking-[0.16em] text-muted-foreground transition-vault hover:text-foreground"
          >
            ← Your orders
          </Link>
        </Container>
      </div>

      <Section spacing="default" className="pt-10">
        <Container>
          <div className="mx-auto max-w-2xl">
            {confirmed === "1" && (
              <p className="mb-6 border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
                Purchase confirmed. Your payment is held securely by Wardrobe
                Vault until fulfilment is complete.
              </p>
            )}

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Order {order.orderNumber}
                </p>
                <h1 className="mt-2 font-heading text-3xl leading-tight">
                  {item?.titleSnapshot ?? "Your purchase"}
                </h1>
              </div>
              <Badge variant="secondary">
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>

            {imageUrl && (
              <div className="mt-8 aspect-[4/5] max-w-xs overflow-hidden border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            )}

            <dl className="mt-10 divide-y divide-border border border-border">
              <div className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-muted-foreground">Seller</dt>
                <dd>{order.seller.name ?? "Seller"}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-muted-foreground">Item price</dt>
                <dd>{formatUgx(order.itemPrice)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-muted-foreground">Platform commission</dt>
                <dd>{formatUgx(order.commissionAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>
                  {order.shippingFee > 0
                    ? formatUgx(order.shippingFee)
                    : "Included"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3 font-heading text-lg">
                <dt>Total paid</dt>
                <dd>{formatUgx(order.totalAmount)}</dd>
              </div>
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Placed{" "}
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(order.placedAt))}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button variant="outline" render={<Link href="/orders" />}>
                All orders
              </Button>
              <Button
                variant="outline"
                render={<Link href={`/messages/${messageThreadId}`} />}
              >
                Message seller
              </Button>
              <Button variant="outline" render={<Link href="/vault" />}>
                Continue browsing
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
