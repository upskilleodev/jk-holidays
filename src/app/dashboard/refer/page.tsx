import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { User } from "@/models/User";
import { CashbackReward } from "@/models/CashbackReward";
import { CashbackSetting } from "@/models/CashbackSetting";
import { CopyReferralButton } from "@/components/dashboard/CopyReferralButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Refer & Earn" };

export default async function ReferPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/refer");

  await connectDB();
  const user = await User.findById(session.userId).select("referralCode");
  if (!user) redirect("/login?next=/dashboard/refer");

  const [rewards, setting, referredUsers] = await Promise.all([
    CashbackReward.find({
      referrerUserId: session.userId,
      source: { $ne: "manual" },
    }).sort({ createdAt: -1 }),
    CashbackSetting.findOne(),
    User.countDocuments({ referredBy: session.userId }),
  ]);

  const rewardAmount =
    setting?.isActive && setting.type === "fixed"
      ? setting.value
      : setting?.isActive
        ? setting.value
        : 2500;

  const rewardLabel =
    setting?.isActive && setting.type === "percentage"
      ? `${setting.value}%`
      : formatINR(rewardAmount);

  const successfulJoins = rewards.filter(
    (r) => r.status === "approved" || r.status === "paid",
  ).length;
  const totalEarned = rewards
    .filter((r) => r.status === "approved" || r.status === "paid")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalReferrals = Math.max(referredUsers, rewards.length);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Refer & Earn</h1>

      <div className="rounded-2xl bg-navy-gradient p-8 text-white shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Gift className="h-14 w-14 text-gold" />
          <h2 className="font-display text-2xl font-bold">
            Invite friends. Earn {rewardLabel} for every signup.
          </h2>
          <p className="max-w-lg text-sm text-white/75">
            Your personal referral code is unique to this login. Share it —
            when a friend joins and their membership is approved, you earn
            cashback.
          </p>
          <div className="mt-4 w-full flex justify-center">
            <CopyReferralButton code={user.referralCode} variant="hero" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Referrals", value: String(totalReferrals) },
          { label: "Successful Joins", value: String(successfulJoins) },
          { label: "Total Earned", value: formatINR(totalEarned) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-display text-3xl font-bold text-navy">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {rewards.length > 0 ? (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold text-navy">
            Recent referral rewards
          </h3>
          <ul className="mt-4 space-y-2">
            {rewards.slice(0, 8).map((reward) => (
              <li
                key={String(reward._id)}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-navy">
                  {formatINR(reward.amount)}
                </span>
                <span className="capitalize text-muted-foreground">
                  {reward.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
