"use client";

import { useActionState } from "react";

import {
  createCategoryAction,
  type AdminCategoryActionState,
} from "@/app/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: AdminCategoryActionState = {};

export function CategoryCreateForm() {
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Add category
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={0}
            disabled={pending}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={2} disabled={pending} />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Category created.
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Creating…" : "Create category"}
      </Button>
    </form>
  );
}
