import Link from "next/link";
import { offers } from "@/lib/site";
import { SectionHeading } from "@/components/home/SectionHeading";

export function OffersSection() {
  return (
    <section id="offers" className="mx-auto max-w-7xl px-4 pb-16">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading eyebrow="Latest Holiday Offers" align="left" />
        <Link
          href="/offers"
          className="text-xs font-bold tracking-widest text-gold hover:underline uppercase shrink-0"
        >
          View All Offers →
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {offers.map((o) => (
          <div
            key={o.tag}
            className={`rounded-xl bg-gradient-to-br ${o.tone} p-5 text-white shadow-lg`}
          >
            <div className="text-xs font-bold tracking-widest uppercase">
              {o.tag}
            </div>
            <div className="mt-2 font-display text-3xl font-bold">
              Flat {o.title}
            </div>
            <div className="mt-1 text-sm text-white/90">{o.text}</div>
            <Link href="/contact" className="btn-primary mt-4 !h-9 !text-xs">
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
