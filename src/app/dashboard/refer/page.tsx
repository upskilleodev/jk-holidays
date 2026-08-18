import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { User } from "@/models/User";
import { CashbackReward } from "@/models/CashbackReward";
import { CopyReferralButton } from "@/components/dashboard/CopyReferralButton";

export const metadata = { title: "Refer & Earn" };

export default async function ReferPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/refer");

  await connectDB();
  const user = await User.findById(session.userId).select("referralCode");
  if (!user) redirect("/login?next=/dashboard/refer");

  const rewards = await CashbackReward.find({
    referrerUserId: session.userId,
  }).sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Refer & Earn
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite friends with your code and earn cashback when they join.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          Your referral code
        </div>
        <div className="mt-4 rounded-md border border-gold/40 bg-cream px-4 py-4 text-center font-display text-2xl tracking-[0.18em]">
          {user.referralCode}
        </div>
        <CopyReferralButton code={user.referralCode} />
        <p className="mt-4 text-sm text-muted-foreground">
          Share via WhatsApp or Instagram. When a friend&apos;s purchase is
          approved, your cashback is recorded.
        </p>

        <div className="mt-6">
          <div className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
            Your cashback rewards
          </div>
          {rewards.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No rewards yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {rewards.map((reward) => (
                <li
                  key={String(reward._id)}
                  className="flex items-center justify-between gap-3 rounded-md border px-3 py-3 text-sm"
                >
                  <span className="font-medium">
                    {formatINR(reward.amount)}
                  </span>
                  <span className="capitalize text-muted-foreground">
                    {reward.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
