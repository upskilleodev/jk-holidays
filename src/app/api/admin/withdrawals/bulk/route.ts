import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { Withdrawal } from "@/models/Withdrawal";
import { applyWithdrawalStatus } from "@/lib/withdrawals";

const bulkSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(100),
  status: z.enum(["approved", "rejected", "paid"]),
  adminNote: z.string().trim().max(240).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = bulkSchema.parse(await request.json());
    await connectDB();

    let updated = 0;
    const failures: { id: string; reason: string }[] = [];

    // Sequential: each approval debits a wallet, so they must not interleave.
    for (const id of body.ids) {
      const withdrawal = await Withdrawal.findById(id);
      if (!withdrawal) {
        failures.push({ id, reason: "Not found" });
        continue;
      }
      const failure = await applyWithdrawalStatus(
        withdrawal,
        body.status,
        body.adminNote,
      );
      if (failure) failures.push({ id, reason: failure });
      else updated += 1;
    }

    return jsonOk({ updated, failures });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
