import Image from "next/image";

import { cn } from "@/lib/utils";

import { Container } from "./container";

type HeroSectionProps = React.ComponentProps<"section"> & {
  backgroundImageUrl: string;
  imageAlt?: string;
};

export function HeroSection({
  backgroundImageUrl,
  imageAlt = "",
  className,
  children,
  ...props
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative min-h-[28rem] overflow-hidden border-b border-border sm:min-h-[32rem] lg:min-h-[36rem]",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={backgroundImageUrl}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />
      </div>

      <div className="relative z-10 flex min-h-[inherit] items-center py-20 sm:py-24 lg:py-28">
        <Container className="animate-fade-in">{children}</Container>
      </div>
    </section>
  );
}
