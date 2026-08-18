"use client";

import { useActionState } from "react";

import {
  createCommissionSettingAction,
  type AdminCommissionActionState,
} from "@/app/actions/admin/commission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommissionSettingType } from "@/lib/generated/prisma/enums";

type Option = { id: string; label: string };

type Props = {
  categories: Option[];
  sellers: Option[];
};

const TYPE_LABELS: Record<CommissionSettingType, string> = {
  [CommissionSettingType.DEFAULT]: "Default",
  [CommissionSettingType.SELLER]: "Seller-specific",
  [CommissionSettingType.CATEGORY]: "Category-specific",
  [CommissionSettingType.PROMOTIONAL]: "Promotional",
};

export function CommissionSettingCreateForm({ categories, sellers }: Props) {
  const [state, formAction, pending] = useActionState<
    AdminCommissionActionState,
    FormData
  >(createCommissionSettingAction, {});

  return (
    <form action={formAction} className="space-y-4 border border-zinc-200 p-5 dark:border-zinc-800">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Add commission rate
      </h3>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-700" role="status">
          Commission setting created.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={CommissionSettingType.DEFAULT}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
          >
            {Object.values(CommissionSettingType).map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Platform default" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ratePercent">Rate (%)</Label>
          <Input
            id="ratePercent"
            name="ratePercent"
            type="number"
            min={0}
            max={100}
            step={0.01}
            required
            placeholder="10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerId">Seller (seller-specific only)</Label>
          <select
            id="sellerId"
            name="sellerId"
            defaultValue=""
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
          >
            <option value="">Optional</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category (category-specific only)</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue=""
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
          >
            <option value="">Optional</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid from (promotional)</Label>
          <Input id="validFrom" name="validFrom" type="date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid until (promotional)</Label>
          <Input id="validUntil" name="validUntil" type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create setting"}
      </Button>
    </form>
  );
}
