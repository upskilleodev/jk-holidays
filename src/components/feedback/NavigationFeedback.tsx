"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { onNavigationStart } from "./toast";

function NavigationFeedbackInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [label, setLabel] = useState("Loading…");
  const safetyTimer = useRef<number | null>(null);

  function begin(nextLabel = "Loading…") {
    setLabel(nextLabel);
    setPending(true);
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    safetyTimer.current = window.setTimeout(() => setPending(false), 8000);
  }

  function end() {
    setPending(false);
    if (safetyTimer.current) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }

  useEffect(() => {
    end();
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download") || anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const current = `${window.location.pathname}${window.location.search}`;
        const next = `${url.pathname}${url.search}`;
        if (current === next) return;
        begin("Loading…");
      } catch {
        // ignore invalid hrefs
      }
    };

    document.addEventListener("click", onClick, true);
    const offNav = onNavigationStart((nextLabel) => begin(nextLabel));
    return () => {
      document.removeEventListener("click", onClick, true);
      offNav();
      if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    };
  }, []);

  if (!pending) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-0.5 overflow-hidden"
        aria-hidden
      >
        <div className="h-full w-1/3 animate-[nav-progress_1.1s_ease-in-out_infinite] bg-gold" />
      </div>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-24 left-1/2 z-[110] -translate-x-1/2 sm:bottom-8"
      >
        <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-navy-deep/95 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
          <span>{label}</span>
        </div>
      </div>
    </>
  );
}

export function NavigationFeedback() {
  return (
    <Suspense fallback={null}>
      <NavigationFeedbackInner />
    </Suspense>
  );
}
