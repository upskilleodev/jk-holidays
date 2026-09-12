import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock3,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { CashbackReward } from "@/models/CashbackReward";
import { User } from "@/models/User";
import { Withdrawal } from "@/models/Withdrawal";
import { formatINR, cn } from "@/lib/utils";
import { RewardStatusButton } from "@/components/admin/RewardStatusButton";
import { WithdrawalActions } from "@/components/admin/WithdrawalActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wallet & Payments" };

export default async function AdminWalletPage() {
  await connectDB();
  const [rewards, withdrawals, membersWithBalance, totalPointsAgg] =
    await Promise.all([
      CashbackReward.find()
        .sort({ createdAt: -1 })
        .limit(40)
        .populate("referrerUserId", "name email referralCode referralPoints")
        .populate("referredUserId", "name email")
        .lean(),
      Withdrawal.find()
        .sort({ createdAt: -1 })
        .limit(40)
        .populate("userId", "name email referralPoints")
        .lean(),
      User.countDocuments({ role: "user", referralPoints: { $gt: 0 } }),
      User.aggregate([
        { $match: { role: "user" } },
        { $group: { _id: null, total: { $sum: "$referralPoints" } } },
      ]),
    ]);

  const circulating = totalPointsAgg[0]?.total || 0;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const pendingPayoutAmount = pendingWithdrawals.reduce(
    (sum, w) => sum + (w.amount || 0),
    0,
  );
  const totalPaidOut = withdrawals
    .filter((w) => w.status === "approved" || w.status === "paid")
    .reduce((sum, w) => sum + (w.amount || 0), 0);
  const pendingRewards = rewards.filter((r) => r.status === "pending");

  type LedgerRow = {
    id: string;
    at: Date;
    memberName: string;
    memberEmail: string;
    desc: string;
    type: "Credit" | "Debit";
    amount: number;
    status: string;
    kind: "reward" | "withdrawal";
  };

  const ledger: LedgerRow[] = [
    ...rewards.map((r) => {
      const member = r.referrerUserId as unknown as {
        name?: string;
        email?: string;
      } | null;
      const isWithdrawalNote = String(r.note || "").includes("Withdrawal");
      return {
        id: `r-${String(r._id)}`,
        at: new Date(r.createdAt),
        memberName: member?.name || "Member",
        memberEmail: member?.email || "",
        desc:
          r.source === "manual"
            ? isWithdrawalNote
              ? "Withdrawal settled"
              : "Manual wallet credit"
            : "Referral cashback",
        type: (isWithdrawalNote ? "Debit" : "Credit") as "Credit" | "Debit",
        amount: r.amount || 0,
        status: r.status,
        kind: "reward" as const,
      };
    }),
    ...withdrawals.map((w) => {
      const member = w.userId as unknown as {
        name?: string;
        email?: string;
      } | null;
      return {
        id: `w-${String(w._id)}`,
        at: new Date(w.createdAt),
        memberName: member?.name || "Member",
        memberEmail: member?.email || "",
        desc: `Withdrawal · ${(w.method || "bank").toUpperCase()}`,
        type: "Debit" as const,
        amount: w.amount || 0,
        status: w.status,
        kind: "withdrawal" as const,
      };
    }),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Wallet & Payments
        </h1>
        <div className="text-sm text-muted-foreground">
          Dashboard › System wallet & payouts
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-navy-gradient p-5 text-white shadow-sm">
          <div className="text-sm text-white/80">Total System Liquidity</div>
          <div className="mt-2 font-display text-3xl font-bold text-gold">
            {formatINR(circulating)}
          </div>
          <div className="mt-1 text-xs text-white/70">
            Points held across member wallets
          </div>
          <Link
            href="/admin/users"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-gold-gradient text-sm font-bold text-navy-deep"
          >
            MANAGE BALANCES
          </Link>
        </div>

        <AdminStatCard
          icon={TrendingUp}
          tone="emerald"
          label="Total Paid Out"
          value={formatINR(totalPaidOut)}
          sub="Approved + paid withdrawals"
          href="/admin/withdrawals"
          linkText="View History"
        />
        <AdminStatCard
          icon={Clock3}
          tone="amber"
          label="Payouts Pending"
          value={formatINR(pendingPayoutAmount)}
          sub={`${pendingWithdrawals.length} under process`}
          href="/admin/withdrawals"
          linkText="Review Queue"
        />
        <AdminStatCard
          icon={Users}
          tone="blue"
          label="Active Wallets"
          value={String(membersWithBalance)}
          sub="Members with balance > 0"
          href="/admin/users"
          linkText="View Members"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-navy">
              Recent Transactions
            </h3>
            <Link
              href="/admin/reports/financial"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-2">Date</th>
                  <th className="pr-2">Member</th>
                  <th className="pr-2">Description</th>
                  <th className="pr-2">Type</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No wallet activity yet.
                    </td>
                  </tr>
                ) : (
                  ledger.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-3 pr-2 whitespace-nowrap">
                        <div>
                          {row.at.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.at.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="pr-2">
                        <div className="font-medium text-navy">
                          {row.memberName}
                        </div>
                        <div className="max-w-[140px] truncate text-xs text-muted-foreground">
                          {row.memberEmail}
                        </div>
                      </td>
                      <td className="pr-2">
                        <div className="font-medium text-navy">{row.desc}</div>
                        <div className="text-xs capitalize text-muted-foreground">
                          {row.status}
                        </div>
                      </td>
                      <td className="pr-2">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                            row.type === "Credit"
                              ? "border-emerald-500 text-emerald-600"
                              : "border-rose-500 text-rose-600",
                          )}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "text-right font-semibold",
                          row.type === "Credit"
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        {row.type === "Credit" ? "+" : "-"}{" "}
                        {formatINR(row.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-navy">
                Payout Management
              </h3>
              <Wallet className="h-5 w-5 text-gold" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Pending withdrawal amount
            </div>
            <div className="font-display text-2xl font-bold text-amber-600">
              {formatINR(pendingPayoutAmount)}
            </div>

            <ul className="mt-4 max-h-[320px] space-y-2 overflow-y-auto">
              {pendingWithdrawals.length === 0 ? (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  No pending payouts.
                </li>
              ) : (
                pendingWithdrawals.slice(0, 8).map((w) => {
                  const member = w.userId as unknown as {
                    name?: string;
                    email?: string;
                  } | null;
                  return (
                    <li
                      key={String(w._id)}
                      className="rounded-xl border px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-navy">
                            {member?.name || "Member"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(w.method || "bank").toUpperCase()} ·{" "}
                            {String(w.accountDetails || "").slice(0, 28)}
                          </div>
                        </div>
                        <div className="font-display font-bold text-navy">
                          {formatINR(w.amount)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <WithdrawalActions
                          id={String(w._id)}
                          status={w.status}
                        />
                      </div>
                    </li>
                  );
                })
              )}
            </ul>

            <Link
              href="/admin/withdrawals"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1 rounded-lg border text-xs font-bold tracking-wide text-navy uppercase hover:bg-muted"
            >
              Open full withdrawals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {pendingRewards.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-700" />
                <h4 className="font-semibold text-navy">
                  Cashback awaiting review
                </h4>
              </div>
              <ul className="mt-3 space-y-2">
                {pendingRewards.slice(0, 3).map((r) => {
                  const member = r.referrerUserId as unknown as {
                    name?: string;
                  } | null;
                  return (
                    <li
                      key={String(r._id)}
                      className="rounded-xl border border-amber-100 bg-white px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-navy">
                          {member?.name || "Member"}
                        </span>
                        <span className="font-semibold">
                          {formatINR(r.amount)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <RewardStatusButton
                          id={String(r._id)}
                          status={r.status}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  href,
  linkText,
}: {
  icon: typeof TrendingUp;
  tone: "emerald" | "blue" | "amber";
  label: string;
  value: string;
  sub: string;
  href: string;
  linkText: string;
}) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-2xl font-bold text-navy">
            {value}
          </div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
        <div
          className={cn(
            "grid h-12 w-12 place-items-center rounded-full",
            tones[tone],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
      >
        {linkText} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
