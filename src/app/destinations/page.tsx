import Image from "next/image";
import { getPublishedResorts } from "@/lib/resorts";
import { SiteShell } from "@/components/layout/SiteShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Destinations",
  description:
    "Explore our premium destinations across India and internationally.",
};

export default async function DestinationsPage() {
  const destinations = await getPublishedResorts();

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-navy">
          Popular Destinations
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <div
              key={d._id || d.name}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl"
            >
              <Image
                src={d.image}
                alt={d.name}
                fill
                className="object-cover transition group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized={d.image.startsWith("http")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="font-display text-2xl font-bold">{d.name}</div>
                <div className="text-sm">{d.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
