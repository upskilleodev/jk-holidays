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
      <div className="flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-navy-gradient p-6 text-white sm:p-8 md:flex-row md:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-widest text-gold">
            REFER & EARN BIG
          </div>
          <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl">
            Invite your friends to join JK Holidays and earn exciting rewards.
          </h3>
        </div>
        <div className="flex w-full max-w-full flex-wrap items-center justify-center gap-3 text-center text-xs">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex min-w-0 items-center gap-2">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/50 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="max-w-24 text-left leading-snug sm:max-w-none">
                  {step.label}
                </div>
                {index < steps.length - 1 ? (
                  <ArrowRight className="h-4 w-4 shrink-0 text-gold" />
                ) : null}
              </div>
            );
          })}
          <Link href="/signup" className="btn-primary shrink-0">
            Know More
          </Link>
        </div>
      </div>
    </section>
  );
}
