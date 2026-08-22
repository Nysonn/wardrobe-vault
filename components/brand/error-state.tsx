"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't complete that just now. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "animate-fade-in mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center",
        className,
      )}
      role="alert"
    >
      <div className="space-y-2">
        <h3 className="font-heading text-2xl tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} type="button">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
