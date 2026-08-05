import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const users = await User.find({ role: "user" })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    const purchases = await Purchase.find().select("userId status packageId");
    const purchaseMap = new Map(
      purchases.map((p) => [String(p.userId), p])
    );

    const enriched = users.map((user) => ({
      ...user.toObject(),
      purchase: purchaseMap.get(String(user._id)) || null,
    }));

    return jsonOk({ users: enriched });
  } catch (error) {
    return handleRouteError(error);
  }
}
