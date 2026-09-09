import Image from "next/image";
import Link from "next/link";
import { destinations } from "@/lib/site";

export const metadata = { title: "Available Holidays" };

export default function HolidaysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Available Holidays
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse destinations and book your next member holiday.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <article
            key={d.name}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <div className="relative h-48">
              <Image
                src={d.image}
                alt={d.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="p-4">
              <div className="font-display text-lg font-bold text-navy">
                {d.name}
              </div>
              <div className="text-xs text-muted-foreground">{d.label}</div>
              <Link
                href={`/dashboard/request?destination=${encodeURIComponent(d.name)}`}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-navy text-sm font-bold text-white hover:bg-navy-soft"
              >
                Book Now
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
