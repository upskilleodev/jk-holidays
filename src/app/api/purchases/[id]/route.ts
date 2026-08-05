import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { Purchase } from "@/models/Purchase";
import { User } from "@/models/User";
import { CashbackSetting } from "@/models/CashbackSetting";
import { CashbackReward } from "@/models/CashbackReward";

const schema = z.object({
  status: z.enum(["pending", "active", "rejected", "cancelled"]),
  adminNote: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = schema.parse(await request.json());
    await connectDB();

    const purchase = await Purchase.findById(id);
    if (!purchase) return jsonError("Purchase not found", 404);

    purchase.status = body.status;
    if (body.adminNote !== undefined) purchase.adminNote = body.adminNote;

    if (body.status === "active") {
      purchase.approvedAt = new Date();

      const buyer = await User.findById(purchase.userId);
      if (buyer?.referredBy) {
        const existingReward = await CashbackReward.findOne({
          purchaseId: purchase._id,
        });

        if (!existingReward) {
          const setting = await CashbackSetting.findOne({ isActive: true });
          if (setting) {
            const amount =
              setting.type === "percentage"
                ? Math.round((purchase.priceSnapshot * setting.value) / 100)
                : setting.value;

            await CashbackReward.create({
              referrerUserId: buyer.referredBy,
              referredUserId: buyer._id,
              purchaseId: purchase._id,
              amount,
              status: "pending",
            });
          }
        }
      } else if (purchase.referralCodeUsed) {
        const referrer = await User.findOne({
          referralCode: purchase.referralCodeUsed,
        });
        if (referrer) {
          const existingReward = await CashbackReward.findOne({
            purchaseId: purchase._id,
          });
          if (!existingReward) {
            const setting = await CashbackSetting.findOne({ isActive: true });
            if (setting) {
              const amount =
                setting.type === "percentage"
                  ? Math.round((purchase.priceSnapshot * setting.value) / 100)
                  : setting.value;

              await CashbackReward.create({
                referrerUserId: referrer._id,
                referredUserId: purchase.userId,
                purchaseId: purchase._id,
                amount,
                status: "pending",
              });
            }
          }
        }
      }
    }

    await purchase.save();

    const populated = await Purchase.findById(purchase._id)
      .populate("userId", "name email referralCode")
      .populate("packageId", "title price duration slug");

    return jsonOk({ purchase: populated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
