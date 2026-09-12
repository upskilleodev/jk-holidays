import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { getSiteContact } from "@/lib/site-settings";
import { getMemberNotificationCount } from "@/lib/notifications";
import { SiteContactProvider } from "@/components/providers/SiteContactProvider";
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
    "name email referralCode notificationsSeenAt",
  );
  if (!user) redirect("/login?next=/dashboard");

  const [contact, unreadCount] = await Promise.all([
    getSiteContact(),
    getMemberNotificationCount(session.userId, user.notificationsSeenAt),
  ]);

  return (
    <SiteContactProvider contact={contact}>
      <MemberShell
        name={user.name}
        memberId={memberIdFrom(user)}
        referralCode={user.referralCode}
        unreadCount={unreadCount}
      >
        {children}
      </MemberShell>
    </SiteContactProvider>
  );
}
