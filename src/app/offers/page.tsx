import Link from "next/link";
import { offers } from "@/lib/site";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Offers",
  description: "Latest holiday offers and discounts for members.",
};

export default function OffersPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-navy">
          Latest Holiday Offers
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {offers.map((o) => (
            <div
              key={o.tag}
              className={`rounded-xl bg-gradient-to-br ${o.tone} p-6 text-white shadow-lg`}
            >
              <div className="text-xs font-bold tracking-widest uppercase">
                {o.tag}
              </div>
              <div className="mt-2 font-display text-4xl font-bold">
                Flat {o.title}
              </div>
              <div className="mt-1 text-sm">{o.text}</div>
              <Link href="/contact" className="btn-primary mt-4 inline-flex">
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
