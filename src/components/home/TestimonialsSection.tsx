"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
} from "lucide-react";
import { testimonials } from "@/lib/site";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/home/SectionHeading";

function Stars() {
  return (
    <div className="flex text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (dx > 40) prev();
    else if (dx < -40) next();
    setTouchStart(null);
  };

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeading eyebrow="Why Members Love JK Holidays" align="left" />

      <div
        className="mt-8 overflow-x-clip md:hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative mx-auto w-full max-w-sm select-none overflow-x-clip">
          <div className="relative overflow-hidden">
            {testimonials.map((item, i) => {
              const offset = (i - index + total) % total;
              const rel = offset > total / 2 ? offset - total : offset;
              const isActive = rel === 0;
              if (Math.abs(rel) > 1) return null;

              return (
                <div
                  key={item.name}
                  className={cn(
                    "inset-0 mx-3 will-change-transform transition-all duration-500 ease-out",
                    isActive ? "relative" : "absolute top-0 right-0 left-0",
                  )}
                  style={{
                    transform: `translateX(${rel * 80}%) scale(${isActive ? 1 : 0.88})`,
                    opacity: isActive ? 1 : 0.3,
                    zIndex: isActive ? 20 : 10,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <div className="relative flex min-h-[220px] flex-col rounded-3xl border border-gold/20 bg-white p-6 shadow-2xl">
                    <Quote className="absolute right-5 top-5 h-10 w-10 text-gold/20" />
                    <Stars />
                    <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="mt-auto flex items-center gap-3 border-t pt-4">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-gold-gradient font-bold text-navy-deep">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-navy">
                          {item.name}
                        </div>
                        <div className="text-xs text-gold">{item.plan}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-5">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={prev}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-navy shadow ring-1 ring-gold/40 hover:bg-gold-soft"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {testimonials.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-5 bg-gold" : "w-1.5 bg-navy/20",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={next}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-navy shadow ring-1 ring-gold/40 hover:bg-gold-soft"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 hidden gap-6 md:grid md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <Stars />
            <p className="mt-3 text-sm italic text-muted-foreground">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-gradient font-bold text-navy-deep">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-navy">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.plan}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
