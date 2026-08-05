import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { CashbackReward } from "@/models/CashbackReward";

const schema = z.object({
  status: z.enum(["pending", "approved", "paid", "cancelled"]),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = schema.parse(await request.json());
    await connectDB();

    const reward = await CashbackReward.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    )
      .populate("referrerUserId", "name email referralCode")
      .populate("referredUserId", "name email");

    if (!reward) return jsonError("Cashback reward not found", 404);
    return jsonOk({ reward });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
