"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
};

/**
 * Full-bleed horizontal strip: fade + arrow sit flush to the screen edges.
 * First card still lines up with the page content gutter.
 */
export function HorizontalScroller({
  children,
  className,
  trackClassName,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollRight(max > 8 && el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [update]);

  function scrollMore() {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: Math.min(240, el.clientWidth * 0.7),
      behavior: "smooth",
    });
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        // Break out of container so fades attach to screen corners
        "w-screen max-w-[100vw] left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]",
        className
      )}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none",
          // Match page gutter on the left; extra right pad under the fade/arrow
          "pl-[max(0.75rem,env(safe-area-inset-left))] pr-14 sm:pl-[max(1rem,env(safe-area-inset-left))] sm:pr-16",
          trackClassName
        )}
      >
        {children}
      </div>

      {/* Right fade — flush to viewport edge */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 sm:w-24",
          "transition-opacity duration-300",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "linear-gradient(to left, var(--scroll-fade, var(--cream)) 0%, var(--scroll-fade, var(--cream)) 40%, transparent 100%)",
        }}
        aria-hidden
      />

      {canScrollRight ? (
        <button
          type="button"
          onClick={scrollMore}
          aria-label="Scroll for more"
          className={cn(
            "absolute right-2 top-1/2 z-10 -translate-y-1/2 sm:right-3",
            "inline-flex h-9 w-9 items-center justify-center rounded-full",
            "bg-ink text-ivory shadow-md border border-white/15"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
