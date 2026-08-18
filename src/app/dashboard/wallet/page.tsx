import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Gift,
  Headphones,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { User } from "@/models/User";
import { CashbackReward } from "@/models/CashbackReward";
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard";
import { WalletActivityList } from "@/components/wallet/WalletActivityList";
import { CopyReferralButton } from "@/components/dashboard/CopyReferralButton";

export const metadata = { title: "My Wallet" };

export default async function WalletPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/wallet");

  await connectDB();
  const user = await User.findById(session.userId).select(
    "name referralPoints referralCode",
  );
  if (!user) redirect("/login?next=/dashboard/wallet");

  const rewards = await CashbackReward.find({
    referrerUserId: session.userId,
  })
    .sort({ createdAt: -1 })
    .limit(40);

  const pending = rewards
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const earned = rewards
    .filter((r) => r.status === "approved" || r.status === "paid")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const paidCount = rewards.filter((r) => r.status === "paid").length;
  const referralCount = rewards.filter((r) => r.source !== "manual").length;

  const activity = rewards.map((r) => ({
    id: String(r._id),
    title:
      r.source === "manual" ? "Admin wallet credit" : "Referral cashback",
    subtitle: [
      new Date(r.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      r.note || null,
    ]
      .filter(Boolean)
      .join(" · "),
    amount: r.amount,
    status: r.status,
    source: r.source || "referral",
    createdAt: new Date(r.createdAt).toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold tracking-[0.22em] text-gold uppercase">
            Payments
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy">
            My Wallet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track rewards, referral earnings, and payment activity in one place.
          </p>
        </div>
      </div>

      <WalletBalanceCard
        balance={user.referralPoints || 0}
        pending={pending}
        earned={earned}
        referralCode={user.referralCode}
        memberName={user.name}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Users,
            label: "Referral rewards",
            value: String(referralCount),
            hint: "Cashback entries",
            tone: "bg-blue-50 text-blue-600",
          },
          {
            icon: ShieldCheck,
            label: "Settled payouts",
            value: String(paidCount),
            hint: "Marked paid",
            tone: "bg-emerald-50 text-emerald-600",
          },
          {
            icon: Sparkles,
            label: "Pending review",
            value: formatINR(pending),
            hint: "Awaiting approval",
            tone: "bg-amber-50 text-amber-600",
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
              <div className="mt-1 font-display text-2xl font-bold text-navy">
                {card.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{card.hint}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <WalletActivityList items={activity} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gold">
              <Gift className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold text-navy">
                Boost your balance
              </h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Invite friends with your personal code. Approved memberships
              unlock cashback into this wallet.
            </p>
            <div className="mt-4 rounded-xl border border-gold/35 bg-cream px-4 py-3 text-center font-display text-xl tracking-[0.16em]">
              {user.referralCode}
            </div>
            <CopyReferralButton code={user.referralCode} />
          </div>

          <div className="rounded-3xl bg-navy-gradient p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-gold">
              <Headphones className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Need a payout?</h3>
            </div>
            <p className="mt-2 text-sm text-white/75">
              Our concierge team can help settle approved wallet rewards offline.
            </p>
            <Link
              href="/dashboard/support"
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-white/10 px-4 text-xs font-bold tracking-wide hover:bg-white/15"
            >
              Contact travel support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
