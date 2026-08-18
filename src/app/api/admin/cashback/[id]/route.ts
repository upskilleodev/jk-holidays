import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { CashbackReward } from "@/models/CashbackReward";
import { User } from "@/models/User";

const schema = z.object({
  status: z.enum(["pending", "approved", "paid", "cancelled"]),
});

type Params = { params: Promise<{ id: string }> };

function isCredited(status: string) {
  return status === "approved" || status === "paid";
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = schema.parse(await request.json());
    await connectDB();

    const reward = await CashbackReward.findById(id);
    if (!reward) return jsonError("Cashback reward not found", 404);

    const wasCredited = isCredited(reward.status);
    const willCredit = isCredited(body.status);

    if (reward.source !== "manual" && wasCredited !== willCredit) {
      const delta = willCredit ? reward.amount : -reward.amount;
      await User.findByIdAndUpdate(reward.referrerUserId, {
        $inc: { referralPoints: delta },
      });
      // Keep balance non-negative
      const user = await User.findById(reward.referrerUserId).select(
        "referralPoints",
      );
      if (user && (user.referralPoints || 0) < 0) {
        user.referralPoints = 0;
        await user.save();
      }
    }

    reward.status = body.status;
    await reward.save();

    const populated = await CashbackReward.findById(reward._id)
      .populate("referrerUserId", "name email referralCode referralPoints")
      .populate("referredUserId", "name email");

    return jsonOk({ reward: populated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
