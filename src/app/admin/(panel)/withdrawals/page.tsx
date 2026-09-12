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
    .populate("userId", "name email mobile referralCode referralPoints")
    .lean();

  const rows: AdminWithdrawalRow[] = withdrawals.map((w) => {
    const member = w.userId as unknown as {
      _id?: { toString(): string };
      name?: string;
      email?: string;
      mobile?: string;
      referralCode?: string;
      referralPoints?: number;
    } | null;
    const tail = String(w._id).slice(-4).toUpperCase();
    const memberTail = member?._id
      ? member._id.toString().slice(-6).toUpperCase()
      : "";
    return {
      id: String(w._id),
      requestId: `WD${tail}`,
      memberName: member?.name || "Member",
      memberEmail: member?.email || "",
      memberMobile: member?.mobile || "",
      memberId: member?.referralCode?.startsWith("JK")
        ? member.referralCode
        : memberTail
          ? `JK${memberTail}`
          : "—",
      memberPoints: member?.referralPoints || 0,
      amount: w.amount,
      method: w.method as "bank" | "upi",
      accountDetails: w.accountDetails,
      bank: {
        accountNumber: w.bank?.accountNumber || "",
        accountHolderName: w.bank?.accountHolderName || "",
        bankName: w.bank?.bankName || "",
        branch: w.bank?.branch || "",
        ifsc: w.bank?.ifsc || "",
      },
      upiId: w.upiId || "",
      remarks: w.remarks || "",
      status: w.status as AdminWithdrawalRow["status"],
      adminNote: w.adminNote || "",
      createdAt: new Date(w.createdAt).toISOString(),
      processedAt: w.processedAt ? new Date(w.processedAt).toISOString() : null,
    };
  });

  return <AdminWithdrawalsPanel withdrawals={rows} />;
}
