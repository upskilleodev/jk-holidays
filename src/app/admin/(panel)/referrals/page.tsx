import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { CashbackSetting } from "@/models/CashbackSetting";
import { CashbackReward } from "@/models/CashbackReward";
import { CashbackSettingsForm } from "@/components/admin/CashbackSettingsForm";
import { RewardStatusButton } from "@/components/admin/RewardStatusButton";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  await connectDB();
  let setting = await CashbackSetting.findOne();
  if (!setting) {
    setting = await CashbackSetting.create({
      type: "fixed",
      value: 1000,
      isActive: true,
    });
  }

  const rewards = await CashbackReward.find()
    .populate("referrerUserId", "name email referralCode")
    .populate("referredUserId", "name email")
    .sort({ createdAt: -1 });

  return (
    <div>
      <div className="eyebrow !text-stone">Growth</div>
      <h1 className="mt-2 page-title">Referrals & cashback</h1>
      <p className="mt-3 text-sm text-stone leading-relaxed">
        Set cashback rules and settle rewards from your phone.
      </p>

      <div className="mt-6">
        <CashbackSettingsForm
          initial={{
            type: setting.type as "fixed" | "percentage",
            value: setting.value,
            isActive: setting.isActive,
          }}
        />
      </div>

      <h2 className="mt-8 font-display text-2xl">Reward records</h2>
      <div className="mt-4 space-y-3">
        {rewards.length === 0 ? (
          <div className="mobile-card text-sm text-stone">No cashback rewards yet.</div>
        ) : (
          rewards.map((reward) => {
            const referrer = reward.referrerUserId as unknown as {
              name?: string;
              email?: string;
            };
            const referred = reward.referredUserId as unknown as {
              name?: string;
              email?: string;
            };
            return (
              <article key={String(reward._id)} className="mobile-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-[0.14em] uppercase text-stone">
                      Referrer
                    </div>
                    <div className="font-medium truncate">{referrer?.name}</div>
                    <div className="text-xs text-stone break-all">
                      {referrer?.email}
                    </div>
                  </div>
                  <span
                    className={`status-pill shrink-0 status-${
                      reward.status === "paid" || reward.status === "approved"
                        ? "active"
                        : reward.status === "cancelled"
                          ? "rejected"
                          : "pending"
                    }`}
                  >
                    {reward.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[10px] tracking-[0.14em] uppercase text-stone">
                      Referred
                    </div>
                    <div className="mt-1 font-medium">{referred?.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.14em] uppercase text-stone">
                      Amount
                    </div>
                    <div className="mt-1 font-display text-xl">
                      {formatINR(reward.amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <RewardStatusButton
                    id={String(reward._id)}
                    status={reward.status}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
