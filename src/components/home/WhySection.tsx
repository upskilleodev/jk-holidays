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
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {whyUs.map((w, i) => {
          const Icon = icons[i] ?? Sparkles;
          return (
            <div key={w.title} className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-gold bg-navy text-gold">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-navy">
                {w.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{w.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
