import Link from "next/link";

import { MarketplaceSettingsForm } from "@/components/admin/marketplace-settings-form";
import {
  ensureDefaultPlatformSettings,
  getPlatformSettings,
} from "@/lib/services/admin/settings";

export default async function AdminSettingsPage() {
  await ensureDefaultPlatformSettings();
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Settings
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Marketplace configuration — commission rates, currency, verification
          policy, and shipping guidance.
        </p>
      </div>

      <nav className="flex flex-wrap gap-4 border-b border-zinc-200 pb-4 text-sm dark:border-zinc-800">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          Marketplace
        </span>
        <Link
          href="/admin/settings/commission"
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Commission rates
        </Link>
      </nav>

      <MarketplaceSettingsForm
        currency={settings.currency}
        verificationPolicy={settings.verificationPolicy}
        shippingGuidance={settings.shippingGuidance}
      />
    </div>
  );
}
