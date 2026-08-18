"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Wallet } from "lucide-react";
import { formatINR } from "@/lib/utils";

type Props = {
  balance: number;
  pending: number;
  earned: number;
  referralCode: string;
  memberName?: string;
};

export function WalletBalanceCard({
  balance,
  pending,
  earned,
  referralCode,
  memberName,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-navy-gradient p-6 text-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.65)] sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #fff 0.6px, transparent 0.7px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            JK Rewards Wallet
          </div>
          <div className="mt-5 text-sm text-white/70">Available balance</div>
          <motion.div
            key={balance}
            initial={{ opacity: 0.4, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl"
          >
            {formatINR(balance)}
          </motion.div>
          {memberName ? (
            <div className="mt-3 text-sm text-white/60">
              {memberName} · Code{" "}
              <span className="font-semibold text-gold">{referralCode}</span>
            </div>
          ) : null}
        </div>
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-gold/50 bg-gold/10 text-gold shadow-inner">
          <Wallet className="h-7 w-7" />
        </div>
      </div>

      <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="text-[11px] tracking-widest text-white/55 uppercase">
            Lifetime earned
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-300">
            {formatINR(earned)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="text-[11px] tracking-widest text-white/55 uppercase">
            Pending payout
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-300">
            {formatINR(pending)}
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/refer"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-xs font-bold tracking-wide text-navy-deep"
        >
          Earn more <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard/rewards"
          className="inline-flex h-11 items-center rounded-xl border border-white/20 px-5 text-xs font-bold tracking-wide text-white hover:bg-white/10"
        >
          View rewards
        </Link>
      </div>
    </motion.div>
  );
}
