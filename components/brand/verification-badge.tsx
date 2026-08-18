import { cn } from "@/lib/utils";

type VerificationBadgeProps = {
  label?: string;
  className?: string;
};

/**
 * Subtle verified-public-figure indicator (initial-prompt §13).
 * Intentionally small, typographic — not a social-media checkmark badge.
 */
export function VerificationBadge({
  label = "Verified",
  className,
}: VerificationBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
