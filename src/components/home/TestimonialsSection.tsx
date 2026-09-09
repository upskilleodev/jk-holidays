"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
} from "lucide-react";
import { site, testimonials } from "@/lib/site";
import { Reveal } from "@/components/home/Reveal";
import { cn } from "@/lib/utils";

const avatarTones = [
  "bg-[#1e3a5f]",
  "bg-[#8b5a2b]",
  "bg-[#2f5d50]",
  "bg-[#5c3d6e]",
  "bg-[#6b3a3a]",
  "bg-[#3d5a80]",
];

function ReviewCard({
  item,
  toneIndex,
}: {
  item: (typeof testimonials)[number];
  toneIndex: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const short =
    item.quote.length > 140 ? `${item.quote.slice(0, 140).trim()}…` : item.quote;

  return (
    <article className="flex w-[min(86vw,320px)] shrink-0 snap-start flex-col rounded-2xl border border-navy/8 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:w-[300px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
              avatarTones[toneIndex % avatarTones.length],
            )}
          >
            {item.shortName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-navy">
              {item.shortName}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {item.date}
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
          <Star className="h-3.5 w-3.5 fill-current" />
          {item.rating}
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-navy/75">
        {expanded ? item.quote : short}{" "}
        {item.quote.length > 140 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-bold text-navy underline-offset-2 hover:underline"
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        ) : null}
      </p>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {item.photos.map((src) => (
          <div
            key={src}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="72px"
            />
          </div>
        ))}
      </div>

      <Link
        href="/destinations"
        className="mt-3 text-sm font-semibold text-gold-dark hover:underline"
      >
        {item.packageLabel}
      </Link>
    </article>
  );
}

function SocialProofStack() {
  return (
    <div className="relative mx-auto w-full max-w-[220px] shrink-0 lg:mx-0">
      <div className="space-y-3">
        <a
          href={site.social.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl bg-[#d8f0e4] px-4 py-3 shadow-sm transition hover:-translate-y-0.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 text-navy">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="text-sm font-bold text-navy">40K+ Community</span>
        </a>
        <div className="flex items-center gap-3 rounded-2xl bg-[#f7d6e0] px-4 py-3 shadow-sm">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 text-navy">
            <Users className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-navy">10K+ Families</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-[#f6ecc2] px-4 py-3 shadow-sm">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-black text-[#4285F4]">
            G
          </span>
          <span className="text-sm font-bold text-navy">
            4.9{" "}
            <span className="font-semibold text-navy/70">(2.4K+ Reviews)</span>
          </span>
        </div>
      </div>
      <div className="absolute -right-3 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-4 border-white bg-navy shadow-lg">
        <Image
          src="/assets/jk-holidays-mark.png"
          alt="JK Holidays"
          width={40}
          height={40}
          className="object-contain"
        />
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(340, el.clientWidth * 0.85) * direction;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section id="testimonials" className="overflow-hidden bg-white py-16">
      <Reveal className="mx-auto max-w-7xl px-4 text-center">
        <h2 className="font-display text-2xl font-bold tracking-wide text-navy uppercase sm:text-3xl md:text-4xl">
          10,000+ Families. Countless Memories.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Real people. Real holidays. Real experiences.
        </p>
      </Reveal>

      <div className="relative mx-auto mt-10 max-w-7xl px-4">
        <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-6">
          <Reveal delay={0.05} className="lg:w-[240px]">
            <SocialProofStack />
          </Reveal>

          <Reveal delay={0.12} className="relative min-w-0 flex-1">
            <button
              type="button"
              aria-label="Previous reviews"
              onClick={() => scrollByCard(-1)}
              className="absolute top-1/2 left-0 z-20 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-navy/10 bg-white text-navy shadow-md hover:bg-cream"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next reviews"
              onClick={() => scrollByCard(1)}
              className="absolute top-1/2 right-0 z-20 grid h-9 w-9 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-navy/10 bg-white text-navy shadow-md hover:bg-cream"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {testimonials.map((item, i) => (
                <ReviewCard key={item.name} item={item} toneIndex={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
