"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // reset to first page on new query
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`/vault?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn("relative flex w-full items-center", className)}
    >
      <input
        type="search"
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Search by item, brand, designer, or name…"
        aria-label="Search listings"
        className={cn(
          "w-full border border-border bg-background py-3 pl-4 pr-16 text-sm",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "transition-opacity",
          isPending && "opacity-50",
        )}
      />
      <button
        type="submit"
        className={cn(
          "absolute right-0 h-full px-4 text-[10px] uppercase tracking-[0.18em]",
          "text-muted-foreground hover:text-foreground transition-colors",
          "border-l border-border bg-muted",
        )}
      >
        Search
      </button>
    </form>
  );
}
