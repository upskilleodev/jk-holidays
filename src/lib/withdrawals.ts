import { User } from "@/models/User";
import { CashbackReward } from "@/models/CashbackReward";

export type WithdrawalStatus = "approved" | "rejected" | "paid";

type WithdrawalDoc = {
  _id: unknown;
  userId: unknown;
  amount: number;
  status: string;
  adminNote?: string;
  processedAt?: Date | null;
  save: () => Promise<unknown>;
};

/**
 * Moves a withdrawal to its next status, debiting the member wallet the first
 * time a request leaves `pending`. Returns an error message when the change is
 * not allowed so callers can report it per request.
 */
export async function applyWithdrawalStatus(
  withdrawal: WithdrawalDoc,
  status: WithdrawalStatus,
  adminNote?: string,
): Promise<string | null> {
  if (withdrawal.status !== "pending" && status !== "paid") {
    return "Only pending withdrawals can be updated";
  }
  if (withdrawal.status === status) {
    return `Already ${status}`;
  }

  if (status === "approved" || status === "paid") {
    if (withdrawal.status === "pending") {
      const user = await User.findById(withdrawal.userId);
      if (!user) return "Member not found";
      if ((user.referralPoints || 0) < withdrawal.amount) {
        return "Member balance is insufficient";
      }
      user.referralPoints = (user.referralPoints || 0) - withdrawal.amount;
      await user.save();

      try {
        await CashbackReward.create({
          referrerUserId: user._id,
          referredUserId: null,
          purchaseId: null,
          amount: withdrawal.amount,
          status: "paid",
          source: "manual",
          note: `Withdrawal ${String(withdrawal._id)} ${status}`,
        });
      } catch (ledgerError) {
        // A ledger write must never block the payout itself.
        console.error("Withdrawal ledger entry failed", ledgerError);
      }
    }
    withdrawal.status = status;
    withdrawal.processedAt = new Date();
  } else {
    withdrawal.status = "rejected";
    withdrawal.processedAt = new Date();
  }

  if (adminNote !== undefined) withdrawal.adminNote = adminNote;
  await withdrawal.save();
  return null;
}
