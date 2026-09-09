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

function planTierFrom(title: string | null | undefined): AdminMemberRow["planTier"] {
  const t = (title || "").toLowerCase();
  if (t.includes("platinum")) return "Platinum";
  if (t.includes("gold")) return "Gold";
  if (t.includes("silver")) return "Silver";
  return "Other";
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
    const planTitle = pkg?.title || null;
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      mobile: user.mobile || "",
      referralCode: user.referralCode,
      memberId: memberIdFrom(user),
      referralPoints: user.referralPoints || 0,
      purchaseStatus: purchase?.status || null,
      planTitle,
      planTier: planTierFrom(planTitle),
      accountStatus:
        user.accountStatus === "inactive" ? "inactive" : "active",
      joinedAt: new Date(user.createdAt).toISOString(),
    };
  });

  return <AdminMembersTable members={members} />;
}
