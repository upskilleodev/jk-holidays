import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { Package } from "@/models/Package";
import { Purchase } from "@/models/Purchase";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await requireSession();
    await connectDB();

    if (session.role === "admin") {
      const purchases = await Purchase.find()
        .populate("userId", "name email referralCode")
        .populate("packageId", "title price duration slug")
        .sort({ createdAt: -1 });
      return jsonOk({ purchases });
    }

    const purchase = await Purchase.findOne({ userId: session.userId }).populate(
      "packageId"
    );
    return jsonOk({ purchase });
  } catch (error) {
    return handleRouteError(error);
  }
}

const createSchema = z.object({
  packageId: z.string().min(1),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (session.role === "admin") {
      return jsonError("Admins cannot purchase membership plans", 400);
    }

    const body = createSchema.parse(await request.json());
    await connectDB();

    const existing = await Purchase.findOne({ userId: session.userId });
    if (existing) {
      return jsonError(
        "You already have a purchase request. Only one membership plan purchase is allowed per user.",
        409
      );
    }

    const pkg = await Package.findOne({
      _id: body.packageId,
      status: "published",
    });
    if (!pkg) return jsonError("Membership plan not found", 404);

    let referralCodeUsed = "";
    if (body.referralCode?.trim()) {
      const code = body.referralCode.trim().toUpperCase();
      const referrer = await User.findOne({ referralCode: code });
      if (!referrer) return jsonError("Invalid referral code", 400);
      if (String(referrer._id) === session.userId) {
        return jsonError("You cannot use your own referral code", 400);
      }
      referralCodeUsed = code;

      const currentUser = await User.findById(session.userId);
      if (currentUser && !currentUser.referredBy) {
        currentUser.referredBy = referrer._id;
        await currentUser.save();
      }
    }

    const purchase = await Purchase.create({
      userId: session.userId,
      packageId: pkg._id,
      priceSnapshot: pkg.price,
      referralCodeUsed,
      status: "pending",
    });

    const populated = await Purchase.findById(purchase._id).populate(
      "packageId"
    );

    return jsonOk({ purchase: populated }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
