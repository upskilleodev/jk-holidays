import Link from "next/link";
import { connectDB } from "@/lib/db";
import { CashbackReward } from "@/models/CashbackReward";
import { formatINR } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wallet & Transactions" };

export default async function AdminWalletPage() {
  await connectDB();
  const rewards = await CashbackReward.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const total = rewards.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div>
      <AdminPageHeader
        title="Wallet & Transactions"
        description="Referral cashback ledger and wallet movements."
        action={
          <Link href="/admin/referrals" className="btn-navy">
            Cashback settings
          </Link>
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="mobile-card">
          <div className="text-[10px] uppercase tracking-widest text-stone">
            Shown rewards
          </div>
          <div className="mt-2 font-display text-2xl text-navy">
            {formatINR(total)}
          </div>
        </div>
        <div className="mobile-card">
          <div className="text-[10px] uppercase tracking-widest text-stone">
            Entries
          </div>
          <div className="mt-2 font-display text-2xl text-navy">
            {rewards.length}
          </div>
        </div>
        <div className="mobile-card">
          <div className="text-[10px] uppercase tracking-widest text-stone">
            Pending
          </div>
          <div className="mt-2 font-display text-2xl text-navy">
            {rewards.filter((r) => r.status === "pending").length}
          </div>
        </div>
      </div>
      <div className="mobile-card overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="py-2">Date</th>
              <th>Type</th>
              <th>Status</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No wallet transactions yet. Approve referred purchases to
                  generate cashback entries.
                </td>
              </tr>
            ) : (
              rewards.map((r) => (
                <tr key={String(r._id)} className="border-b">
                  <td className="py-3">
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td>Referral cashback</td>
                  <td>
                    <span className={`status-pill status-${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="text-right font-medium">
                    {formatINR(r.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
