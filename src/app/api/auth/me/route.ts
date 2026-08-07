import { getAdminSession, getMemberSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jsonOk } from "@/lib/api";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  const session =
    scope === "admin"
      ? await getAdminSession()
      : scope === "member"
        ? await getMemberSession()
        : (await getMemberSession()) || (await getAdminSession());

  if (!session) return jsonOk({ user: null, member: null, admin: null });

  await connectDB();
  const user = await User.findById(session.userId).select("-passwordHash");
  if (!user) return jsonOk({ user: null, member: null, admin: null });

  const purchase =
    user.role === "user"
      ? await Purchase.findOne({ userId: user._id }).populate("packageId")
      : null;

  const member = await getMemberSession();
  const admin = await getAdminSession();

  return jsonOk({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
    },
    purchase,
    sessions: {
      member: member
        ? { name: member.name, email: member.email, role: member.role }
        : null,
      admin: admin
        ? { name: admin.name, email: admin.email, role: admin.role }
        : null,
    },
  });
}
