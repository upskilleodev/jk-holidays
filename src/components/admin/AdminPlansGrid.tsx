"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Crown, MoonStar, Sparkles } from "lucide-react";
import { toast } from "@/components/feedback/toast";
import { cn, formatINR } from "@/lib/utils";

export type AdminPlanCard = {
  id: string;
  title: string;
  price: number;
  duration: string;
  validity: string;
  status: "draft" | "published";
  isFeatured: boolean;
  badge: string;
  coverImage: string;
  inclusionsCount: number;
};

function tierAccent(title: string) {
  const t = title.toLowerCase();
  if (t.includes("platinum")) {
    return {
      bar: "from-violet-500 to-fuchsia-500",
      chip: "bg-violet-100 text-violet-800",
      icon: "bg-violet-100 text-violet-700",
    };
  }
  if (t.includes("gold")) {
    return {
      bar: "from-amber-400 to-yellow-500",
      chip: "bg-amber-100 text-amber-800",
      icon: "bg-amber-100 text-amber-700",
    };
  }
  if (t.includes("silver")) {
    return {
      bar: "from-slate-400 to-slate-500",
      chip: "bg-slate-200 text-slate-700",
      icon: "bg-slate-100 text-slate-700",
    };
  }
  return {
    bar: "from-navy to-navy-soft",
    chip: "bg-navy/10 text-navy",
    icon: "bg-gold-soft text-navy",
  };
}

function PlanCard({ plan }: { plan: AdminPlanCard }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const accent = tierAccent(plan.title);
  const published = plan.status === "published";

  async function toggleStatus() {
    setLoading(true);
    const next = published ? "draft" : "published";
    const res = await fetch(`/api/packages/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error || "Could not update plan", "error");
      return;
    }
    toast(
      next === "published" ? "Plan enabled on website" : "Plan disabled",
      "success",
    );
    router.refresh();
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]",
        !published && "opacity-85",
      )}
    >
      <div className={cn("h-1.5 w-full bg-gradient-to-r", accent.bar)} />

      <div className="relative aspect-[16/9] bg-muted">
        {plan.coverImage ? (
          <Image
            src={plan.coverImage}
            alt={plan.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={plan.coverImage.startsWith("http")}
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <Crown className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy-deep/55 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
              published
                ? "bg-emerald-500 text-white"
                : "bg-white/90 text-navy",
            )}
          >
            {published ? "Live" : "Disabled"}
          </span>
          {plan.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-bold text-navy-deep">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          ) : null}
          {plan.badge ? (
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", accent.chip)}>
              {plan.badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-navy">
            {plan.title}
          </h2>
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full",
              accent.icon,
            )}
          >
            <Crown className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 font-display text-3xl font-bold text-gold">
          {formatINR(plan.price)}
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MoonStar className="h-4 w-4 text-gold" />
            <span>{plan.duration || "Duration TBA"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold" />
            <span>{plan.validity || "Validity TBA"}</span>
          </div>
          <div className="text-xs">
            {plan.inclusionsCount} inclusions listed
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link
            href={`/admin/packages/${plan.id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-navy/15 text-sm font-semibold text-navy hover:bg-muted"
          >
            Edit
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={toggleStatus}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-lg text-sm font-semibold disabled:opacity-60",
              published
                ? "bg-gold-gradient text-navy-deep"
                : "border border-navy/15 text-navy hover:bg-muted",
            )}
          >
            {loading ? "…" : published ? "Disable" : "Enable"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function AdminPlansGrid({ plans }: { plans: AdminPlanCard[] }) {
  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center shadow-sm">
        <Crown className="mx-auto h-8 w-8 text-gold" />
        <p className="mt-3 font-display text-xl font-bold text-navy">
          No membership plans yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add Silver, Gold, or Platinum to start selling memberships.
        </p>
        <Link
          href="/admin/packages/new"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-navy px-4 text-sm font-semibold text-white"
        >
          + Add Plan
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
