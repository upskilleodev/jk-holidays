"use client";

import { Sparkles } from "lucide-react";

const TICKER_ITEMS = [
  "Premium resort stays",
  "Member-only pricing",
  "Domestic & international",
  "Hotel · Food · Trekking",
  "Referral cashback",
  "Concierge support",
];

function TickerGroup({ copy }: { copy: number }) {
  return (
    <div className="hero-ticker-group" aria-hidden={copy > 0}>
      {TICKER_ITEMS.map((item) => (
        <span key={`${copy}-${item}`} className="hero-ticker-item">
          <Sparkles
            className="h-3.5 w-3.5 shrink-0 text-gold"
            strokeWidth={1.75}
          />
          {item}
        </span>
      ))}
    </div>
  );
}

/** Seamless rolling labels under the hero */
export function HeroTicker() {
  return (
    <div className="relative z-20 overflow-hidden border-t border-white/10 bg-ink">
      <div className="flex h-[3.25rem] items-center sm:h-14">
        <div className="hero-ticker-track">
          <TickerGroup copy={0} />
          <TickerGroup copy={1} />
        </div>
      </div>
    </div>
  );
}
