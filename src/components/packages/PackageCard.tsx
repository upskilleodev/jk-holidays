import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

export type PackageCardData = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  price: number;
  originalPrice?: number | null;
  duration: string;
  validity?: string;
  coverImage: string;
  badge?: string;
  inclusions?: string[];
  isFeatured?: boolean;
};

function planLabel(title: string) {
  return title.split(/\s+/)[0]?.toUpperCase() || title.toUpperCase();
}

export function PackageCard({ pkg }: { pkg: PackageCardData }) {
  const discount =
    pkg.originalPrice && pkg.originalPrice > pkg.price
      ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
      : null;
  const isPopular = (pkg.badge || "").toUpperCase().includes("POPULAR");
  const badgeLabel = pkg.badge?.trim();

  return (
    <article
      className={cn(
        "card-shine group relative flex h-full flex-col overflow-hidden rounded-xl bg-white text-navy-deep shadow-xl transition-transform duration-500 hover:-translate-y-1",
        isPopular && "ring-4 ring-gold",
      )}
    >
      {discount ? (
        <div className="absolute right-0 top-4 z-10 rounded-l-md bg-red-600 px-3 py-1 text-[10px] font-bold text-white">
          {discount}% OFF
        </div>
      ) : null}

      <div
        className={cn(
          "px-6 py-4 text-center font-display text-xl font-bold",
          isPopular
            ? "bg-gold-gradient text-navy-deep"
            : "bg-slate-100 text-navy",
        )}
      >
        {planLabel(pkg.title)}
        {badgeLabel ? (
          <div className="text-[10px] tracking-widest">{badgeLabel}</div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6 text-center">
        {pkg.originalPrice ? (
          <div className="text-sm text-muted-foreground line-through">
            {formatINR(pkg.originalPrice)}
          </div>
        ) : null}
        <div className="text-xs font-semibold text-muted-foreground">
          OFFER PRICE
        </div>
        <div className="mt-1 font-display text-4xl font-bold text-navy">
          {formatINR(pkg.price)}
        </div>
        <div
          className={cn(
            "mt-4 rounded-md py-2 text-xs font-semibold",
            isPopular ? "bg-gold-soft text-navy" : "bg-slate-100 text-navy",
          )}
        >
          {pkg.duration}
          {pkg.validity ? ` · ${pkg.validity}` : ""}
        </div>
        <ul className="mt-5 flex-1 space-y-2 text-left text-sm">
          {(pkg.inclusions || []).slice(0, 5).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          href={`/packages/${pkg.slug}?request=1`}
          className="btn-navy mt-6 w-full"
        >
          Join Now
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
