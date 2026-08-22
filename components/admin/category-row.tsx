"use client";

import { useActionState } from "react";

import {
  updateCategoryAction,
  type AdminCategoryActionState,
} from "@/app/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CategoryRowProps = {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    _count: { listings: number };
  };
};

const initialState: AdminCategoryActionState = {};

export function CategoryRow({ category }: CategoryRowProps) {
  const [state, formAction, pending] = useActionState(
    updateCategoryAction,
    initialState,
  );

  return (
    <li className="rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="categoryId" value={category.id} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor={`name-${category.id}`}>Name</Label>
            <Input
              id={`name-${category.id}`}
              name="name"
              defaultValue={category.name}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`sort-${category.id}`}>Sort order</Label>
            <Input
              id={`sort-${category.id}`}
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={category.sortOrder}
              disabled={pending}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`active-${category.id}`}>Status</Label>
            <select
              id={`active-${category.id}`}
              name="isActive"
              defaultValue={category.isActive ? "true" : "false"}
              disabled={pending}
              className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="pb-2 text-xs text-zinc-500">
              {category._count.listings} listing
              {category._count.listings === 1 ? "" : "s"} · {category.slug}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`desc-${category.id}`}>Description</Label>
          <Textarea
            id={`desc-${category.id}`}
            name="description"
            rows={2}
            defaultValue={category.description ?? ""}
            disabled={pending}
          />
        </div>
        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-700 dark:text-green-400">Saved.</p>
        ) : null}
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </li>
  );
}
