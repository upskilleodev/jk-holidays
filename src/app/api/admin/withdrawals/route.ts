import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, handleRouteError } from "@/lib/api";
import { Withdrawal } from "@/models/Withdrawal";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const withdrawals = await Withdrawal.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name email referralCode referralPoints")
      .lean();
    return jsonOk({ withdrawals });
  } catch (error) {
    return handleRouteError(error);
  }
}
