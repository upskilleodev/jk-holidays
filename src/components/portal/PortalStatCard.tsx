import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PortalStatCard({
  title,
  value,
  sub,
  foot,
  progress,
  cta,
  ctaHref,
  ctaOutline,
  icon: Icon,
  tone = "blue",
}: {
  title: string;
  value: string;
  sub: string;
  foot?: string;
  progress?: number;
  cta?: string;
  ctaHref?: string;
  ctaOutline?: boolean;
  icon: LucideIcon;
  tone?: "blue" | "emerald" | "violet" | "amber";
}) {
  const tones = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-3xl font-bold text-navy">{value}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-full",
            tones[tone],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {progress != null ? (
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      ) : null}
      {foot ? (
        <div className="mt-2 text-xs text-muted-foreground">{foot}</div>
      ) : null}
      {cta && ctaHref ? (
        <Link
          href={ctaHref}
          className={cn(
            "mt-3 flex h-9 w-full items-center justify-center rounded-lg text-xs font-bold tracking-wide",
            ctaOutline
              ? "border border-border text-navy hover:bg-muted"
              : "bg-navy text-white hover:bg-navy-soft",
          )}
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}
