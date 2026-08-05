import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";
import { Package } from "@/models/Package";
import { Purchase } from "@/models/Purchase";
import { CashbackReward } from "@/models/CashbackReward";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [users, packages, pending, active, cashbackPending] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        Package.countDocuments(),
        Purchase.countDocuments({ status: "pending" }),
        Purchase.countDocuments({ status: "active" }),
        CashbackReward.countDocuments({ status: "pending" }),
      ]);

    return jsonOk({
      stats: {
        users,
        packages,
        pendingPurchases: pending,
        activePurchases: active,
        pendingCashback: cashbackPending,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
