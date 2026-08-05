import { Crown } from "lucide-react";

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const text = variant === "light" ? "text-white" : "text-navy";
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold-gradient text-navy-deep">
        <Crown className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <div className={`min-w-0 leading-none ${text}`}>
        <div className="font-display text-lg font-bold tracking-wide sm:text-xl">
          <span className="text-gold">JK</span> HOLIDAYS
        </div>
        <div className="mt-0.5 truncate text-[8px] tracking-[0.14em] opacity-80 sm:text-[9px] sm:tracking-[0.25em]">
          MEMORIES ... FOR LIFE
        </div>
      </div>
    </div>
  );
}
