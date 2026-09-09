import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";
import { Withdrawal } from "@/models/Withdrawal";
import { CashbackReward } from "@/models/CashbackReward";

const patchSchema = z.object({
  status: z.enum(["approved", "rejected", "paid"]),
  adminNote: z.string().trim().max(240).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await request.json());
    await connectDB();

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return jsonError("Withdrawal not found", 404);

    if (withdrawal.status !== "pending" && body.status !== "paid") {
      return jsonError("Only pending withdrawals can be updated", 400);
    }

    if (body.status === "approved" || body.status === "paid") {
      if (withdrawal.status === "pending") {
        const user = await User.findById(withdrawal.userId);
        if (!user) return jsonError("Member not found", 404);
        if ((user.referralPoints || 0) < withdrawal.amount) {
          return jsonError("Member balance is insufficient", 400);
        }
        user.referralPoints = (user.referralPoints || 0) - withdrawal.amount;
        await user.save();

        await CashbackReward.create({
          referrerUserId: user._id,
          referredUserId: null,
          purchaseId: null,
          amount: withdrawal.amount,
          status: "paid",
          source: "manual",
          note: `Withdrawal ${String(withdrawal._id)} ${body.status}`,
        });
      }
      withdrawal.status = body.status;
      withdrawal.processedAt = new Date();
    } else if (body.status === "rejected") {
      withdrawal.status = "rejected";
      withdrawal.processedAt = new Date();
    }

    if (body.adminNote !== undefined) withdrawal.adminNote = body.adminNote;
    await withdrawal.save();

    const populated = await Withdrawal.findById(withdrawal._id).populate(
      "userId",
      "name email referralCode referralPoints",
    );

    return jsonOk({ withdrawal: populated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
