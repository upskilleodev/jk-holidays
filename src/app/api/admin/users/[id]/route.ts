import { z } from "zod";
import { connectDB } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";
import { CashbackReward } from "@/models/CashbackReward";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z
  .object({
    referralPoints: z.number().min(0).optional(),
    password: z.string().min(6).optional(),
    note: z.string().max(240).optional(),
  })
  .refine((v) => v.referralPoints !== undefined || v.password !== undefined, {
    message: "Provide referralPoints and/or password",
  });

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select("-passwordHash");
    if (!user || user.role !== "user") {
      return jsonError("User not found", 404);
    }

    const [purchase, rewards] = await Promise.all([
      Purchase.findOne({ userId: id })
        .populate("packageId", "title duration slug")
        .lean(),
      CashbackReward.find({ referrerUserId: id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    return jsonOk({
      user: {
        ...user.toObject(),
        passwordSet: true,
      },
      purchase,
      rewards,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await request.json());
    await connectDB();

    const user = await User.findById(id);
    if (!user || user.role !== "user") {
      return jsonError("User not found", 404);
    }

    const updates: {
      referralPoints?: number;
      passwordSet?: boolean;
    } = {};

    if (body.referralPoints !== undefined) {
      const previous = user.referralPoints || 0;
      const next = Math.round(body.referralPoints);
      const delta = next - previous;
      user.referralPoints = next;

      if (delta !== 0) {
        await CashbackReward.create({
          referrerUserId: user._id,
          referredUserId: null,
          purchaseId: null,
          amount: Math.abs(delta),
          status: delta > 0 ? "approved" : "cancelled",
          source: "manual",
          note:
            body.note?.trim() ||
            `Admin set referral points from ${previous} to ${next}`,
        });
      }
      updates.referralPoints = next;
    }

    let plainPassword: string | undefined;
    if (body.password) {
      user.passwordHash = await hashPassword(body.password);
      plainPassword = body.password;
      updates.passwordSet = true;
    }

    await user.save();

    return jsonOk({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referralPoints: user.referralPoints || 0,
      },
      password: plainPassword,
      updates,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}

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
