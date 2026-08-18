import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";
import {
  AdminMembersTable,
  type AdminMemberRow,
} from "@/components/admin/AdminMembersTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Members" };

function memberIdFrom(user: {
  _id: { toString(): string };
  referralCode: string;
}) {
  const tail = user._id.toString().slice(-6).toUpperCase();
  return user.referralCode?.startsWith("JK") ? user.referralCode : `JK${tail}`;
}

export default async function AdminUsersPage() {
  await connectDB();
  const users = await User.find({ role: "user" })
    .select("-passwordHash")
    .sort({ createdAt: -1 });

  const purchases = await Purchase.find()
    .select("userId status packageId")
    .populate("packageId", "title");

  const purchaseMap = new Map(
    purchases.map((p) => [String(p.userId), p] as const),
  );

  const members: AdminMemberRow[] = users.map((user) => {
    const purchase = purchaseMap.get(String(user._id));
    const pkg = purchase?.packageId as { title?: string } | null | undefined;
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      memberId: memberIdFrom(user),
      referralPoints: user.referralPoints || 0,
      purchaseStatus: purchase?.status || null,
      planTitle: pkg?.title || null,
      joinedAt: new Date(user.createdAt).toISOString(),
    };
  });

  return <AdminMembersTable members={members} />;
}
