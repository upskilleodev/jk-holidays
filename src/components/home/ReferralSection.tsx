import Link from "next/link";
import { ArrowRight, Award, UserPlus, Users } from "lucide-react";

const steps = [
  { label: "Invite Friends", icon: UserPlus },
  { label: "They Join", icon: Users },
  { label: "Earn Rewards", icon: Award },
];

export function ReferralSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-navy-gradient p-8 text-white md:flex-row md:justify-between">
        <div>
          <div className="text-xs font-bold tracking-widest text-gold">
            REFER & EARN BIG
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold">
            Invite your friends to join JK Holidays and earn exciting rewards.
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-center text-xs">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-2">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-gold/50 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="max-w-16">{step.label}</div>
                {index < steps.length - 1 ? (
                  <ArrowRight className="h-4 w-4 text-gold" />
                ) : null}
              </div>
            );
          })}
          <Link href="/signup" className="btn-primary">
            Know More
          </Link>
        </div>
      </div>
    </section>
  );
}
