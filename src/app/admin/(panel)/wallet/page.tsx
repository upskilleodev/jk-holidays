import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  Clock3,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { CashbackReward } from "@/models/CashbackReward";
import { User } from "@/models/User";
import { formatINR } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RewardStatusButton } from "@/components/admin/RewardStatusButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wallet & Payments" };

export default async function AdminWalletPage() {
  await connectDB();
  const [rewards, membersWithBalance, totalPointsAgg] = await Promise.all([
    CashbackReward.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("referrerUserId", "name email referralCode referralPoints")
      .populate("referredUserId", "name email")
      .lean(),
    User.countDocuments({ role: "user", referralPoints: { $gt: 0 } }),
    User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: null, total: { $sum: "$referralPoints" } } },
    ]),
  ]);

  const circulating = totalPointsAgg[0]?.total || 0;
  const pendingRewards = rewards.filter((r) => r.status === "pending");
  const pendingAmount = pendingRewards.reduce(
    (sum, r) => sum + (r.amount || 0),
    0,
  );
  const paidAmount = rewards
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const manualCount = rewards.filter((r) => r.source === "manual").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Wallet & Payments"
        description="A live view of member balances, referral cashback, and settlement actions."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/users" className="btn-navy">
              Set member points
            </Link>
            <Link
              href="/admin/referrals"
              className="btn-ghost !border-border !text-navy"
            >
              Cashback rules
            </Link>
          </div>
        }
      />

      <div className="relative overflow-hidden rounded-3xl bg-navy-gradient p-6 text-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.55)] sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Payments console
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              {formatINR(circulating)}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Total referral points currently held across member wallets
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 bg-gold/10 text-gold">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] tracking-widest text-white/55 uppercase">
              Pending settlement
            </div>
            <div className="mt-1 font-display text-2xl font-bold text-amber-300">
              {formatINR(pendingAmount)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] tracking-widest text-white/55 uppercase">
              Marked paid
            </div>
            <div className="mt-1 font-display text-2xl font-bold text-emerald-300">
              {formatINR(paidAmount)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] tracking-widest text-white/55 uppercase">
              Wallets with balance
            </div>
            <div className="mt-1 font-display text-2xl font-bold">
              {membersWithBalance}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Clock3,
            label: "Pending requests",
            value: String(pendingRewards.length),
            hint: "Need approve / pay",
            tone: "bg-amber-50 text-amber-600",
          },
          {
            icon: BadgeIndianRupee,
            label: "Manual adjustments",
            value: String(manualCount),
            hint: "Admin set points",
            tone: "bg-gold/15 text-gold-dark",
          },
          {
            icon: Users,
            label: "Ledger entries",
            value: String(rewards.length),
            hint: "Latest 50 shown",
            tone: "bg-sky-50 text-sky-600",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl ${card.tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {card.label}
              </div>
              <div className="mt-1 font-display text-3xl font-bold text-navy">
                {card.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{card.hint}</div>
            </div>
          );
        })}
      </div>

      {pendingRewards.length > 0 ? (
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-navy">
                Action needed
              </h3>
              <p className="text-sm text-muted-foreground">
                Pending cashback waiting for approval or payout.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              {pendingRewards.length} pending
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {pendingRewards.slice(0, 4).map((r) => {
              const member = r.referrerUserId as unknown as {
                name?: string;
                email?: string;
              } | null;
              return (
                <div
                  key={String(r._id)}
                  className="rounded-2xl border border-amber-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-navy">
                        {member?.name || "Member"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {member?.email}
                      </div>
                    </div>
                    <div className="font-display text-xl font-bold text-navy">
                      {formatINR(r.amount)}
                    </div>
                  </div>
                  <div className="mt-3">
                    <RewardStatusButton
                      id={String(r._id)}
                      status={r.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-display text-lg font-bold text-navy">
              Transaction ledger
            </h3>
            <p className="text-xs text-muted-foreground">
              Referral cashback and manual wallet adjustments
            </p>
          </div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600"
          >
            Manage balances <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[oklch(0.97_0.01_260)] text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Member</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No wallet transactions yet. Set points from Members or
                    approve referred purchases.
                  </td>
                </tr>
              ) : (
                rewards.map((r) => {
                  const member = r.referrerUserId as unknown as {
                    name?: string;
                    email?: string;
                    referralPoints?: number;
                  } | null;
                  return (
                    <tr key={String(r._id)} className="border-t">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                            {(member?.name || "M").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-navy">
                              {member?.name || "—"}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {member?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-medium">
                          {r.source === "manual"
                            ? "Manual points"
                            : "Referral cashback"}
                        </div>
                        {r.note ? (
                          <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {r.note}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-3 py-4">
                        <span className={`status-pill status-${r.status}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right font-display text-base font-bold text-navy">
                        {formatINR(r.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <div className="w-44">
                            <RewardStatusButton
                              id={String(r._id)}
                              status={r.status}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {rewards.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No wallet transactions yet.
            </p>
          ) : (
            rewards.map((r) => {
              const member = r.referrerUserId as unknown as {
                name?: string;
                email?: string;
              } | null;
              return (
                <article
                  key={String(r._id)}
                  className="rounded-2xl border border-border/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-navy">
                        {member?.name || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.source === "manual"
                          ? "Manual points"
                          : "Referral cashback"}{" "}
                        · {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-bold text-navy">
                        {formatINR(r.amount)}
                      </div>
                      <span className={`status-pill status-${r.status}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <RewardStatusButton
                      id={String(r._id)}
                      status={r.status}
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
