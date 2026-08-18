import type { ReactNode } from "react";

import { PageShell } from "@/components/layout/page-shell";

/** Marketplace layout — wraps public-facing browse/detail pages */
export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
