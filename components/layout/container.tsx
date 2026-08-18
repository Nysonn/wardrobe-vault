import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  width?: "narrow" | "default" | "wide";
};

const widthClasses = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export function Container({
  className,
  width = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 sm:px-8 lg:px-10",
        widthClasses[width],
        className,
      )}
      {...props}
    />
  );
}
