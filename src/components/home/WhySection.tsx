import {
  Award,
  Globe,
  Heart,
  Headphones,
  Sparkles,
  Wallet,
} from "lucide-react";
import { whyUs } from "@/lib/site";
import { SectionHeading } from "@/components/home/SectionHeading";

const icons = [Heart, Sparkles, Award, Wallet, Headphones, Globe];

export function WhySection() {
  return (
    <section id="why" className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeading eyebrow="Why JK Holidays?" />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
        {whyUs.map((w, i) => {
          const Icon = icons[i] ?? Sparkles;
          return (
            <div
              key={w.title}
              className="flex flex-col items-center px-1 text-center"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-gold bg-navy text-gold">
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="mt-3 flex min-h-[2.75rem] items-start justify-center font-display text-base font-bold leading-snug text-navy">
                {w.title}
              </h3>
              <p className="mt-1 max-w-[11.5rem] text-xs leading-relaxed text-muted-foreground md:max-w-none">
                {w.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
