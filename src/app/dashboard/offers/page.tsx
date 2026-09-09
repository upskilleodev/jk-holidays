import Link from "next/link";
import { offers } from "@/lib/site";

export const metadata = { title: "Offers & Discounts" };

export default function OffersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Offers & Discounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Exclusive member deals on domestic and international holidays.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {offers.map((o) => (
          <article
            key={o.tag}
            className={`flex flex-col rounded-2xl bg-gradient-to-br ${o.tone} p-5 text-white shadow-sm`}
          >
            <div className="text-xs font-bold tracking-wide uppercase">
              {o.tag}
            </div>
            <div className="mt-3 font-display text-3xl font-bold">
              Flat {o.title}
            </div>
            <div className="mt-1 text-sm text-white/90">{o.text}</div>
            <Link
              href="/dashboard/request"
              className="mt-5 inline-flex h-9 w-fit items-center justify-center rounded-md bg-gold-gradient px-4 text-xs font-bold text-navy-deep"
            >
              BOOK NOW
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
