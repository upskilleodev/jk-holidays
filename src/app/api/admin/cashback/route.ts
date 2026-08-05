import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { CashbackSetting } from "@/models/CashbackSetting";
import { CashbackReward } from "@/models/CashbackReward";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    let setting = await CashbackSetting.findOne();
    if (!setting) {
      setting = await CashbackSetting.create({
        type: "fixed",
        value: 1000,
        isActive: true,
      });
    }

    const rewards = await CashbackReward.find()
      .populate("referrerUserId", "name email referralCode")
      .populate("referredUserId", "name email")
      .populate("purchaseId")
      .sort({ createdAt: -1 });

    return jsonOk({ setting, rewards });
  } catch (error) {
    return handleRouteError(error);
  }
}

const settingSchema = z.object({
  type: z.enum(["fixed", "percentage"]),
  value: z.number().positive(),
  isActive: z.boolean(),
});

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = settingSchema.parse(await request.json());
    await connectDB();

    let setting = await CashbackSetting.findOne();
    if (!setting) {
      setting = await CashbackSetting.create(body);
    } else {
      setting.type = body.type;
      setting.value = body.value;
      setting.isActive = body.isActive;
      await setting.save();
    }

    return jsonOk({ setting });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
