import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";

export async function POST() {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    await connectDB();
    await User.updateOne(
      { _id: session.userId },
      { $set: { notificationsSeenAt: new Date() } },
    );

    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
