"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type ListingGalleryProps = {
  images: GalleryImage[];
  title: string;
  className?: string;
};

/**
 * Editorial image gallery (initial-prompt §37): main image, thumbnails, fullscreen view.
 */
export function ListingGallery({ images, title, className }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const active = images[activeIndex];
  const hasMultiple = images.length > 1;

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      const next = (index + images.length) % images.length;
      setActiveIndex(next);
    },
    [images.length],
  );

  useEffect(() => {
    if (!fullscreenOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
      if (event.key === "Escape") setFullscreenOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreenOpen, activeIndex, goTo]);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-[3/4] items-center justify-center bg-muted",
          className,
        )}
      >
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          No photographs
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Main image */}
      <button
        type="button"
        onClick={() => setFullscreenOpen(true)}
        className="group relative aspect-[3/4] w-full overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open full-screen gallery"
      >
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 bg-background/90 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ExpandIcon className="size-3" />
          View full screen
        </span>
      </button>

      {/* Thumbnails */}
      {hasMultiple && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Gallery thumbnails"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1} of ${images.length}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden border bg-muted transition-vault focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-20",
                index === activeIndex
                  ? "border-foreground"
                  : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${title} — view ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-screen gallery */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent
          showCloseButton
          className="flex h-[min(92vh,900px)] max-w-[min(96vw,1200px)] flex-col gap-0 overflow-hidden border-0 bg-background p-0 sm:max-w-[min(96vw,1200px)]"
        >
          <DialogTitle className="sr-only">{title} — image gallery</DialogTitle>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-muted">
            <Image
              src={active.url}
              alt={active.altText ?? title}
              fill
              sizes="96vw"
              className="object-contain"
              priority
            />

            {hasMultiple && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90"
                  onClick={() => goTo(activeIndex - 1)}
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90"
                  onClick={() => goTo(activeIndex + 1)}
                  aria-label="Next image"
                >
                  <ChevronRightIcon />
                </Button>
              </>
            )}
          </div>

          {hasMultiple && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {activeIndex + 1} of {images.length}
              </p>
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "relative size-12 shrink-0 overflow-hidden border",
                      index === activeIndex
                        ? "border-foreground"
                        : "border-border opacity-60 hover:opacity-100",
                    )}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
