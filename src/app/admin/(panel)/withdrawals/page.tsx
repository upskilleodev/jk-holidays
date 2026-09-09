import { connectDB } from "@/lib/db";
import { Withdrawal } from "@/models/Withdrawal";
import {
  AdminWithdrawalsPanel,
  type AdminWithdrawalRow,
} from "@/components/admin/AdminWithdrawalsPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Withdrawals" };

export default async function AdminWithdrawalsPage() {
  await connectDB();
  const withdrawals = await Withdrawal.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("userId", "name email referralPoints")
    .lean();

  const rows: AdminWithdrawalRow[] = withdrawals.map((w) => {
    const member = w.userId as unknown as {
      name?: string;
      email?: string;
      referralPoints?: number;
    } | null;
    const tail = String(w._id).slice(-4).toUpperCase();
    return {
      id: String(w._id),
      requestId: `WD${tail}`,
      memberName: member?.name || "Member",
      memberEmail: member?.email || "",
      memberPoints: member?.referralPoints || 0,
      amount: w.amount,
      method: w.method as "bank" | "upi",
      accountDetails: w.accountDetails,
      remarks: w.remarks || "",
      status: w.status as AdminWithdrawalRow["status"],
      adminNote: w.adminNote || "",
      createdAt: new Date(w.createdAt).toISOString(),
    };
  });

  return <AdminWithdrawalsPanel withdrawals={rows} />;
}
