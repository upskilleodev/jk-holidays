import { Crown } from "lucide-react";

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const text = variant === "light" ? "text-white" : "text-navy";
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-gradient text-navy-deep">
        <Crown className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <div className={`leading-none ${text}`}>
        <div className="font-display text-xl font-bold tracking-wide">
          <span className="text-gold">JK</span> HOLIDAYS
        </div>
        <div className="mt-0.5 text-[9px] tracking-[0.25em] opacity-80">
          MEMORIES ... FOR LIFE
        </div>
      </div>
    </div>
  );
}
