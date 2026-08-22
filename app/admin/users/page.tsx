import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { searchAdminUsers } from "@/lib/services/admin/users";

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const result = await searchAdminUsers(query || undefined, page);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Users
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Search members, review seller activity, and suspend accounts.
        </p>
      </div>

      <form className="flex max-w-md gap-2" action="/admin/users" method="get">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Search by name or email"
        />
        <button
          type="submit"
          className="shrink-0 border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Search
        </button>
      </form>

      {result.users.length === 0 ? (
        <EmptyState
          title={query ? "No members match that search." : "No members yet."}
          description={
            query
              ? "Try a different name or email."
              : "Registered members will appear here."
          }
        />
      ) : (
        <>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {result.users.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name ?? "Unnamed user"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {user.email} · {user._count.listings} listings ·{" "}
                      {user._count.ordersAsSeller} sales
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {user.suspendedAt ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : null}
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {result.totalPages > 1 ? (
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              {page > 1 ? (
                <Link
                  href={`/admin/users?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  ← Previous
                </Link>
              ) : null}
              <span>
                Page {page} of {result.totalPages}
              </span>
              {page < result.totalPages ? (
                <Link
                  href={`/admin/users?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Next →
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
