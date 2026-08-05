import { Sparkles } from "lucide-react";
import {
  PackageCard,
  type PackageCardData,
} from "@/components/packages/PackageCard";
import { PlansCoverflow } from "@/components/packages/PlansCoverflow";

export function PackagesSection({ packages }: { packages: PackageCardData[] }) {
  return (
    <section id="plans" className="bg-navy-gradient py-16 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <div className="text-xs font-bold tracking-[0.3em] text-gold">
            ━━ OUR MEMBERSHIP PLANS ━━
          </div>
        </div>

        <div className="mt-8">
          <PlansCoverflow packages={packages} />
        </div>

        <div className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-white/70">
          <Sparkles className="mr-1 inline h-3 w-3 text-gold" />
          All plans come with exciting referral benefits & reward points
        </p>
      </div>
    </section>
  );
}
