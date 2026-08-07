"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { onToast, type ToastPayload, type ToastTone } from "./toast";

type ToastItem = ToastPayload & { id: number };

const icons: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return onToast((payload) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev.slice(-2), { ...payload, id }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, payload.durationMs ?? 2800);
    });
  }, []);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 safe-top">
      {items.map((item) => {
        const tone = item.tone || "info";
        const Icon = icons[tone];
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex max-w-sm items-start gap-2 rounded-xl border px-3.5 py-3 text-sm shadow-lg backdrop-blur",
              "animate-[toast-in_220ms_ease-out]",
              tone === "success" &&
                "border-emerald-200 bg-white/95 text-emerald-800",
              tone === "error" &&
                "border-red-200 bg-white/95 text-red-700",
              tone === "info" &&
                "border-gold/40 bg-white/95 text-navy",
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 leading-snug">{item.message}</p>
            <button
              type="button"
              aria-label="Dismiss"
              className="rounded p-0.5 opacity-60 hover:opacity-100"
              onClick={() =>
                setItems((prev) => prev.filter((t) => t.id !== item.id))
              }
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
