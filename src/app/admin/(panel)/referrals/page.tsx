import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { CashbackSetting } from "@/models/CashbackSetting";
import { CashbackReward } from "@/models/CashbackReward";
import { CashbackSettingsForm } from "@/components/admin/CashbackSettingsForm";
import { RewardStatusButton } from "@/components/admin/RewardStatusButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Referrals & Cashback" };

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

  const pending = rewards.filter((r) => r.status === "pending").length;
  const approved = rewards.filter(
    (r) => r.status === "approved" || r.status === "paid",
  ).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Referrals & Cashback"
        description="Tune reward rules and settle referral payments with a polished payments workflow."
        action={
          <Link href="/admin/wallet" className="btn-navy">
            Open wallet & payments
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">Program</div>
          <div className="mt-1 font-display text-2xl font-bold text-navy">
            {setting.isActive ? "Live" : "Paused"}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">Pending rewards</div>
          <div className="mt-1 font-display text-2xl font-bold text-navy">
            {pending}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">Settled rewards</div>
          <div className="mt-1 font-display text-2xl font-bold text-navy">
            {approved}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CashbackSettingsForm
            initial={{
              type: setting.type as "fixed" | "percentage",
              value: setting.value,
              isActive: setting.isActive,
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-display text-lg font-bold text-navy">
                Reward settlements
              </h2>
              <p className="text-xs text-muted-foreground">
                Approve and mark referral payouts
              </p>
            </div>
            <div className="max-h-[640px] space-y-3 overflow-y-auto p-4">
              {rewards.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No cashback rewards yet.
                </div>
              ) : (
                rewards.map((reward) => {
                  const referrer = reward.referrerUserId as unknown as {
                    name?: string;
                    email?: string;
                  };
                  const referred = reward.referredUserId as unknown as {
                    name?: string;
                    email?: string;
                  } | null;
                  return (
                    <article
                      key={String(reward._id)}
                      className="rounded-2xl border border-border/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                            {reward.source === "manual"
                              ? "Manual adjustment"
                              : "Referrer"}
                          </div>
                          <div className="truncate font-semibold text-navy">
                            {referrer?.name}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {referrer?.email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-xl font-bold text-navy">
                            {formatINR(reward.amount)}
                          </div>
                          <span
                            className={`status-pill status-${
                              reward.status === "paid" ||
                              reward.status === "approved"
                                ? "active"
                                : reward.status === "cancelled"
                                  ? "rejected"
                                  : "pending"
                            }`}
                          >
                            {reward.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">
                        {reward.source === "manual"
                          ? reward.note || "Admin set points"
                          : `Referred: ${referred?.name || "—"}`}
                      </div>

                      <div className="mt-3 max-w-[200px]">
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
        </div>
      </div>
    </div>
  );
}
