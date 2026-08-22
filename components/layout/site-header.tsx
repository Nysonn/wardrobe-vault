import Link from "next/link";

import { getSession } from "@/lib/auth/guards";

import { SiteHeaderMenu } from "./site-header-menu";
import { SiteHeaderShell } from "./site-header-shell";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <SiteHeaderShell>
      <Link
        href="/"
        className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Wardrobe Vault
      </Link>
      <SiteHeaderMenu isAuthenticated={!!session?.user?.id} />
    </SiteHeaderShell>
  );
}
