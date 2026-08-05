import { Building2, Globe, Star, Users } from "lucide-react";
import { steps } from "@/lib/site";
import { SectionHeading } from "@/components/home/SectionHeading";

const stats = [
  { value: "10,000+", label: "Happy Families", icon: Users },
  { value: "500+", label: "Premium Resorts", icon: Building2 },
  { value: "25+", label: "Countries", icon: Globe },
  { value: "4.9 ★", label: "Customer Rating", icon: Star },
];

export function HowSection() {
  return (
    <section id="how" className="bg-navy-gradient py-16 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading eyebrow="How It Works" light />
        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-gold bg-navy">
                <span className="text-2xl font-bold text-gold">{s.step}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-xs text-white/70">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-6 md:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3">
                <Icon className="h-8 w-8 text-gold" />
                <div>
                  <div className="font-display text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-white/70">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
