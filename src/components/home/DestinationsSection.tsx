import Image from "next/image";
import Link from "next/link";
import { destinations } from "@/lib/site";
import { SectionHeading } from "@/components/home/SectionHeading";

export function DestinationsSection() {
  return (
    <section id="destinations" className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading eyebrow="Popular Destinations" align="left" />
        <Link
          href="/destinations"
          className="text-xs font-bold tracking-widest text-gold hover:underline uppercase shrink-0"
        >
          View All Destinations →
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {destinations.map((d) => (
          <div
            key={d.name}
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={d.image}
              alt={d.name}
              fill
              className="object-cover transition group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 16vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <div className="font-display text-lg font-bold">{d.name}</div>
              <div className="text-xs text-white/80">{d.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
