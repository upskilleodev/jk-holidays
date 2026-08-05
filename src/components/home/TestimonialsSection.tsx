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
  const [active, setActive] = useState(0);
  const go = (dir: -1 | 1) => {
    setActive((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeading eyebrow="Why Members Love JK Holidays" align="left" />

      <div className="mt-8 md:hidden">
        <div className="relative mx-auto w-full max-w-sm select-none">
          <div className="relative h-[280px]">
            {testimonials.map((item, index) => {
              const offset = index - active;
              if (Math.abs(offset) > 1) return null;
              return (
                <div
                  key={item.name}
                  className="absolute inset-0 mx-3 transition-all duration-500 ease-out"
                  style={{
                    transform:
                      offset === 0
                        ? "translateX(0%) scale(1)"
                        : `translateX(${offset * 80}%) scale(0.88)`,
                    opacity: offset === 0 ? 1 : 0.3,
                    zIndex: offset === 0 ? 20 : 10,
                  }}
                >
                  <div className="relative h-full rounded-3xl border border-gold/20 bg-white p-6 shadow-2xl">
                    <Quote className="absolute right-5 top-5 h-10 w-10 text-gold/20" />
                    <Stars />
                    <p className="mt-3 line-clamp-4 text-sm italic leading-relaxed text-muted-foreground">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="mt-6 flex items-center gap-3 border-t pt-4">
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
          <div className="mt-4 flex items-center justify-center gap-5">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => go(-1)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-navy shadow ring-1 ring-gold/40 hover:bg-gold-soft"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {testimonials.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === active ? "w-5 bg-gold" : "w-1.5 bg-navy/20",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => go(1)}
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
