import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { User } from "@/models/User";
import { MemberShell } from "@/components/dashboard/MemberShell";

export const dynamic = "force-dynamic";

function memberIdFrom(user: { _id: { toString(): string }; referralCode: string }) {
  const tail = user._id.toString().slice(-6).toUpperCase();
  return user.referralCode?.startsWith("JK")
    ? user.referralCode
    : `JK${tail}`;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard");

  await connectDB();
  const user = await User.findById(session.userId).select(
    "name email referralCode",
  );
  if (!user) redirect("/login?next=/dashboard");

  return (
    <MemberShell
      name={user.name}
      memberId={memberIdFrom(user)}
      referralCode={user.referralCode}
    >
      {children}
    </MemberShell>
  );
}
