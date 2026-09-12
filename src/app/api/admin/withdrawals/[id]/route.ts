import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { Withdrawal } from "@/models/Withdrawal";
import { applyWithdrawalStatus } from "@/lib/withdrawals";

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

    const failure = await applyWithdrawalStatus(
      withdrawal,
      body.status,
      body.adminNote,
    );
    if (failure) return jsonError(failure, 400);

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
