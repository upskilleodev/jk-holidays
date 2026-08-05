import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jsonOk } from "@/lib/api";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonOk({ user: null });

  await connectDB();
  const user = await User.findById(session.userId).select("-passwordHash");
  if (!user) return jsonOk({ user: null });

  const purchase = await Purchase.findOne({ userId: user._id }).populate(
    "packageId"
  );

  return jsonOk({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
    },
    purchase,
  });
}
