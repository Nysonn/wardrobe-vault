"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 16;

type SiteHeaderShellProps = {
  children: React.ReactNode;
};

export function SiteHeaderShell({ children }: SiteHeaderShellProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const updateHeight = () => {
      setHeaderHeight(header.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, [scrolled]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-out motion-reduce:transition-none",
          scrolled
            ? "border-border/60 bg-background/90 shadow-[0_1px_0_0_var(--border),0_8px_32px_-12px_oklch(0.28_0.015_50/10%)] backdrop-blur-md supports-[backdrop-filter]:bg-background/75"
            : "border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90",
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 ease-out motion-reduce:transition-none sm:px-6 lg:px-8",
            scrolled ? "py-3" : "py-4",
          )}
        >
          {children}
        </div>
      </header>
      <div
        aria-hidden
        className="shrink-0 transition-[height] duration-300 ease-out motion-reduce:transition-none"
        style={{ height: headerHeight }}
      />
    </>
  );
}
