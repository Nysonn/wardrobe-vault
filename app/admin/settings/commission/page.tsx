import Link from "next/link";

import {
  getCommissionFormOptions,
  getCommissionSettings,
} from "@/lib/services/admin/commission";
import { CommissionSettingCreateForm } from "@/components/admin/commission-setting-create-form";
import { CommissionSettingRow } from "@/components/admin/commission-setting-row";

export default async function AdminCommissionSettingsPage() {
  const [settings, options] = await Promise.all([
    getCommissionSettings(),
    getCommissionFormOptions(),
  ]);

  const categoryOptions = options.categories.map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const sellerOptions = options.sellers.map((s) => ({
    id: s.id,
    label: s.name ? `${s.name} (${s.email ?? "no email"})` : (s.email ?? s.id),
  }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/settings"
          className="text-xs uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Settings
        </Link>
        <h2 className="mt-3 text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Commission settings
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Configure default, seller-specific, category-specific, and promotional
          commission rates. Rates are never hardcoded — checkout always resolves
          from these settings.
        </p>
      </div>

      <CommissionSettingCreateForm
        categories={categoryOptions}
        sellers={sellerOptions}
      />

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Active & historical rates
        </h3>
        {settings.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No commission settings configured yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {settings.map((setting) => (
              <CommissionSettingRow key={setting.id} setting={setting} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
