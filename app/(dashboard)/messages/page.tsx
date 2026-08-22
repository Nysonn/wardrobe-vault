import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/guards";
import { listMessageThreads } from "@/lib/services/messages";

export const dynamic = "force-dynamic";

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function MessagesPage() {
  const session = await requireAuth();
  const threads = await listMessageThreads(session.user.id);

  return (
    <>
      <div className="border-b border-border py-6">
        <Container>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Account
          </p>
          <h1 className="mt-2 font-heading text-3xl">Messages</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Correspondence with buyers and sellers — held privately, without
            hurry.
          </p>
        </Container>
      </div>

      <Section spacing="default" className="pt-10">
        <Container>
          {threads.length === 0 ? (
            <EmptyState
              title="No conversations yet."
              description="When you message a seller or buyer about an order, the thread will appear here."
              action={
                <Button variant="outline" render={<Link href="/orders" />}>
                  View orders
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border border border-border">
              {threads.map((thread) => (
                <li key={thread.threadId}>
                  <Link
                    href={`/messages/${thread.threadId}`}
                    className="flex items-start justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-lg text-foreground">
                          {thread.otherUser.name ?? "Contact"}
                        </p>
                        {thread.unreadCount > 0 ? (
                          <span className="bg-vault-accent px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-background">
                            {thread.unreadCount} new
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {thread.lastMessage}
                      </p>
                    </div>
                    <p className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {formatTimestamp(thread.lastMessageAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
