import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";
import { CashbackReward } from "@/models/CashbackReward";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);
    if (!user) return jsonError("User not found", 404);
    if (user.role === "admin") {
      return jsonError("Admin accounts cannot be deleted here", 400);
    }

    await Promise.all([
      Purchase.deleteMany({ userId: id }),
      CashbackReward.deleteMany({
        $or: [{ referrerUserId: id }, { referredUserId: id }],
      }),
      User.findByIdAndDelete(id),
    ]);

    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
