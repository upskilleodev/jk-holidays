import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { User } from "@/models/User";
import { CashbackReward } from "@/models/CashbackReward";
import { Withdrawal } from "@/models/Withdrawal";
import {
  MemberWalletPanel,
  type WalletTxn,
  type WalletWithdrawal,
} from "@/components/wallet/MemberWalletPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Wallet" };

export default async function WalletPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/wallet");

  await connectDB();
  const user = await User.findById(session.userId).select(
    "name referralPoints referralCode bankAccount upiId",
  );
  if (!user) redirect("/login?next=/dashboard/wallet");

  const [rewards, withdrawals] = await Promise.all([
    CashbackReward.find({ referrerUserId: session.userId })
      .sort({ createdAt: -1 })
      .limit(50),
    Withdrawal.find({ userId: session.userId }).sort({ createdAt: -1 }).limit(50),
  ]);

  const balance = user.referralPoints || 0;
  const totalEarnings = rewards
    .filter((r) => r.status === "approved" || r.status === "paid")
    .filter((r) => !(r.source === "manual" && String(r.note || "").includes("Withdrawal")))
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "approved" || w.status === "paid")
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  const pendingAmount = withdrawals
    .filter((w) => w.status === "pending")
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  // Build ledger-style transactions from rewards + withdrawals
  type Raw = {
    at: Date;
    desc: string;
    sub: string;
    type: "Credit" | "Debit";
    amount: number;
    id: string;
    status?: string;
  };

  const raw: Raw[] = [
    ...rewards.map((r) => {
      const isWithdrawalNote = String(r.note || "").includes("Withdrawal");
      return {
        id: `r-${String(r._id)}`,
        at: new Date(r.createdAt),
        desc:
          r.source === "manual"
            ? isWithdrawalNote
              ? "Withdrawal Settled"
              : "Admin wallet credit"
            : "Referral Bonus",
        sub:
          r.note ||
          (r.status === "pending" ? "Pending approval" : r.status),
        type: (isWithdrawalNote ? "Debit" : "Credit") as "Credit" | "Debit",
        amount: r.amount,
        status: r.status,
      };
    }),
    ...withdrawals.map((w) => ({
      id: `w-${String(w._id)}`,
      at: new Date(w.createdAt),
      desc: "Withdrawal Request",
      sub: `${w.method.toUpperCase()} · ${w.status}`,
      type: "Debit" as const,
      amount: w.amount,
      status: w.status,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  // Reconstruct approximate running balance from current balance walking backwards
  let cursor = balance;
  const transactions: WalletTxn[] = raw.map((item) => {
    const balanceAfter = cursor;
    if (item.type === "Credit" && (item.status === "approved" || item.status === "paid" || !item.status)) {
      // already reflected; for display we show balanceAfter then rewind
    }
    if (item.type === "Debit" && (item.status === "approved" || item.status === "paid")) {
      cursor += item.amount;
    } else if (item.type === "Credit" && (item.status === "approved" || item.status === "paid")) {
      cursor -= item.amount;
    }
    return {
      id: item.id,
      date: item.at.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: item.at.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      desc: item.desc,
      sub: item.sub,
      type: item.type,
      amount: item.amount,
      balance: Math.max(0, balanceAfter),
      status: item.status,
    };
  });

  const withdrawalRows: WalletWithdrawal[] = withdrawals.map((w) => ({
    id: String(w._id),
    amount: w.amount,
    method: w.method,
    accountDetails: w.accountDetails,
    remarks: w.remarks || "",
    status: w.status,
    createdAt: new Date(w.createdAt).toISOString(),
  }));

  return (
    <MemberWalletPanel
      balance={balance}
      totalEarnings={Math.max(totalEarnings, balance + totalWithdrawn)}
      totalWithdrawn={totalWithdrawn}
      pendingAmount={pendingAmount}
      transactions={transactions}
      withdrawals={withdrawalRows}
      bank={{
        accountNumber: user.bankAccount?.accountNumber || "",
        accountHolderName: user.bankAccount?.accountHolderName || "",
        bankName: user.bankAccount?.bankName || "",
        branch: user.bankAccount?.branch || "",
        ifsc: user.bankAccount?.ifsc || "",
        upiId: user.upiId || "",
      }}
    />
  );
}
