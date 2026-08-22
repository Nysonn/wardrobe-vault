import Link from "next/link";
import { notFound } from "next/navigation";

import { UserActionPanel } from "@/components/admin/user-action-panel";
import { Badge } from "@/components/ui/badge";
import { formatUgx } from "@/lib/format/currency";
import { getAdminUserDetail } from "@/lib/services/admin/users";

type PageProps = {
  params: Promise<{ userId: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { userId } = await params;
  const user = await getAdminUserDetail(userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="text-xs uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Users
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              {user.name ?? "Unnamed user"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{user.role}</Badge>
            {user.suspendedAt ? (
              <Badge variant="destructive">Suspended</Badge>
            ) : null}
            {user.isVerifiedPublicFigure ? (
              <Badge variant="default">Verified figure</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Account summary
            </h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Joined</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Listings</dt>
                <dd>{user._count.listings}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Sales as seller</dt>
                <dd>{user._count.ordersAsSeller}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Purchases</dt>
                <dd>{user._count.ordersAsBuyer}</dd>
              </div>
            </dl>
            {user.suspendedReason ? (
              <p className="mt-4 text-sm text-red-600">
                Suspension reason: {user.suspendedReason}
              </p>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Recent listings
            </h3>
            {user.listings.length === 0 ? (
              <p className="text-sm text-zinc-500">No listings yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {user.listings.map((listing) => (
                  <li key={listing.id} className="py-3 text-sm">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="font-medium hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {listing.status} · {formatUgx(listing.price)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Recent sales
            </h3>
            {user.ordersAsSeller.length === 0 ? (
              <p className="text-sm text-zinc-500">No sales yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {user.ordersAsSeller.map((order) => (
                  <li key={order.id} className="py-3 text-sm">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {order.status} · {formatUgx(order.totalAmount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <UserActionPanel
          userId={user.id}
          isSuspended={user.suspendedAt !== null}
        />
      </div>
    </div>
  );
}
