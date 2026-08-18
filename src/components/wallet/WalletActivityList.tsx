"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  Gift,
  Settings2,
  XCircle,
} from "lucide-react";
import { formatINR, cn } from "@/lib/utils";

export type WalletActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  source: string;
  createdAt: string;
};

const statusMeta: Record<
  string,
  { label: string; className: string; icon: typeof BadgeCheck }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    className: "bg-sky-100 text-sky-700",
    icon: BadgeCheck,
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-700",
    icon: BadgeCheck,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700",
    icon: XCircle,
  },
};

export function WalletActivityList({ items }: { items: WalletActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold">
          <Gift className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-navy">
          Your wallet is ready
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Share your referral code. When friends join and get approved, rewards
          land here instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4 sm:px-6">
        <h3 className="font-display text-lg font-bold text-navy">
          Payment activity
        </h3>
        <p className="text-xs text-muted-foreground">
          Credits, referral cashback, and admin adjustments
        </p>
      </div>
      <ul className="divide-y">
        {items.map((item, index) => {
          const meta = statusMeta[item.status] || statusMeta.pending;
          const StatusIcon = meta.icon;
          const isCredit =
            item.status === "approved" ||
            item.status === "paid" ||
            (item.source === "manual" && item.status !== "cancelled");
          const TypeIcon =
            item.source === "manual"
              ? Settings2
              : isCredit
                ? ArrowDownLeft
                : ArrowUpRight;

          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6"
            >
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
                  isCredit
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600",
                )}
              >
                <TypeIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate font-semibold text-navy">
                    {item.title}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      meta.className,
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {meta.label}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.subtitle}
                </div>
              </div>
              <div
                className={cn(
                  "shrink-0 text-right font-display text-lg font-bold",
                  isCredit ? "text-emerald-600" : "text-navy",
                )}
              >
                {isCredit ? "+" : ""}
                {formatINR(item.amount)}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
