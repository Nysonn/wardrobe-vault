import { cn } from "@/lib/utils";

type PageShellProps = React.ComponentProps<"div"> & {
  tone?: "ivory" | "cream";
};

export function PageShell({
  className,
  tone = "ivory",
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col",
        tone === "ivory" && "bg-background",
        tone === "cream" && "bg-muted",
        className,
      )}
      {...props}
    />
  );
}
