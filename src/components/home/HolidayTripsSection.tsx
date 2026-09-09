"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { destinations } from "@/lib/site";
import { Reveal } from "@/components/home/Reveal";
import {
  HolidayTripCard,
  type HolidayTrip,
} from "@/components/home/HolidayTripCard";

const trips: HolidayTrip[] = destinations.map((d, i) => ({
  name: d.name,
  title: `${d.name} Holiday Package`,
  image: d.image,
  duration: i % 2 === 0 ? "4 Days & 3 Nights" : "3 Days & 2 Nights",
  rating: i === 4 ? 4.8 : 4.9,
  reviews: [128, 96, 84, 72, 61, 55][i] || 50,
  badge: ["20%", "15%", "25%", "18%", "22%", "12%"][i],
  photos: [
    d.image,
    destinations[(i + 1) % destinations.length].image,
    destinations[(i + 2) % destinations.length].image,
  ],
}));

export function HolidayTripsSection({
  title = "Member Holiday Packages",
  limit,
}: {
  title?: string;
  limit?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const items = limit ? trips.slice(0, limit) : trips;

  function scrollByCard(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: Math.min(360, el.clientWidth * 0.9) * direction,
      behavior: "smooth",
    });
  }

  return (
    <section id="holiday-packages" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Photos, ratings, and enquiry options — pricing shared after callback.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="relative mt-8">
          <button
            type="button"
            aria-label="Previous packages"
            onClick={() => scrollByCard(-1)}
            className="absolute top-[38%] left-0 z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-navy/10 bg-white text-navy shadow lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next packages"
            onClick={() => scrollByCard(1)}
            className="absolute top-[38%] right-0 z-10 grid h-9 w-9 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-navy/10 bg-white text-navy shadow lg:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((trip) => (
              <HolidayTripCard key={trip.name} trip={trip} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
