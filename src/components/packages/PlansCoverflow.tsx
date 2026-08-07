"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn, formatINR } from "@/lib/utils";
import type { PackageCardData } from "@/components/packages/PackageCard";

function planLabel(title: string) {
  return title.split(/\s+/)[0] || title;
}

function validityYears(validity?: string) {
  if (!validity) return null;
  return validity.match(/(\d+)/)?.[1] ?? null;
}

export function PlansCoverflow({ packages }: { packages: PackageCardData[] }) {
  const initial = useMemo(() => {
    const popular = packages.findIndex((p) =>
      (p.badge || "").toUpperCase().includes("POPULAR"),
    );
    return popular >= 0 ? popular : Math.min(1, packages.length - 1);
  }, [packages]);

  const [active, setActive] = useState(Math.max(0, initial));

  if (!packages.length) return null;

  const go = (dir: -1 | 1) => {
    setActive((prev) => (prev + dir + packages.length) % packages.length);
  };

  return (
    <div className="w-full overflow-x-clip md:hidden">
      <div className="relative mx-auto w-full max-w-sm select-none overflow-x-clip px-1">
        <div className="relative overflow-hidden">
          {packages.map((pkg, index) => {
            const offset = index - active;
            if (Math.abs(offset) > 1) return null;
            const years = validityYears(pkg.validity);
            const isActive = offset === 0;

            return (
              <div
                key={pkg._id}
                role={!isActive ? "button" : undefined}
                tabIndex={!isActive ? 0 : undefined}
                aria-label={
                  !isActive
                    ? `Show ${planLabel(pkg.title)} plan`
                    : undefined
                }
                onClick={() => {
                  if (!isActive) setActive(index);
                }}
                onKeyDown={(e) => {
                  if (!isActive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setActive(index);
                  }
                }}
                className={cn(
                  "inset-x-0 top-0 mx-auto will-change-transform transition-all duration-500 ease-out",
                  isActive ? "relative" : "absolute",
                )}
                style={{
                  transform: isActive
                    ? "translate3d(0,0,0) scale(1)"
                    : `translate3d(${offset * 62}%,0,0) scale(0.88)`,
                  opacity: isActive ? 1 : 0.35,
                  zIndex: isActive ? 30 : 10,
                }}
              >
                <div
                  className={cn(
                    "card-shine relative mx-3 overflow-hidden rounded-3xl bg-white text-left text-navy-deep shadow-2xl ring-1 ring-gold/20",
                    offset !== 0 && "card-shine-paused",
                  )}
                >
                  <div className="relative m-3 mt-10 h-40 overflow-hidden rounded-2xl">
                    <Image
                      src={pkg.coverImage || "/assets/hero-resort.jpg"}
                      alt={pkg.title}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                    <div className="absolute inset-0 bg-navy-deep/25" />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="font-display text-3xl font-bold uppercase tracking-wide text-white drop-shadow-lg">
                        {planLabel(pkg.title)}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-5 text-center">
                    <div className="text-xs font-semibold text-muted-foreground">
                      {pkg.duration}
                    </div>
                    <ul className="mt-3 space-y-1.5 text-left text-[13px]">
                      {(pkg.inclusions || []).slice(0, 3).map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-baseline justify-center gap-2">
                      {pkg.originalPrice ? (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatINR(pkg.originalPrice)}
                        </span>
                      ) : null}
                      <span className="font-display text-2xl font-bold text-gold">
                        {formatINR(pkg.price)}
                      </span>
                      {years ? (
                        <span className="text-xs text-muted-foreground">
                          /{years}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-gold">
                      <Sparkles className="mr-1 inline h-3 w-3" />
                      Limited-time member pricing
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/packages/${pkg.slug}?request=1`}
                        className="btn-primary !h-9 flex-1 !text-[10px] !px-2"
                      >
                        Join Now
                      </Link>
                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="inline-flex flex-1 items-center justify-center rounded-md border border-gold/50 px-3 text-[10px] font-bold uppercase text-navy hover:bg-gold-soft"
                      >
                        Know More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Previous plan"
            onClick={() => go(-1)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-navy shadow-md ring-1 ring-gold/40 hover:bg-gold-soft"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {packages.map((pkg, index) => (
              <button
                key={pkg._id}
                type="button"
                aria-label={`Go to ${planLabel(pkg.title)}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === active ? "w-6 bg-gold" : "w-2 bg-white/40",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next plan"
            onClick={() => go(1)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-navy shadow-md ring-1 ring-gold/40 hover:bg-gold-soft"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
