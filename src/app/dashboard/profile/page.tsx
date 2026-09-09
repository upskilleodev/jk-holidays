import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { User } from "@/models/User";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Profile" };

function memberIdFrom(user: {
  _id: { toString(): string };
  referralCode: string;
}) {
  const tail = user._id.toString().slice(-6).toUpperCase();
  return user.referralCode?.startsWith("JK")
    ? user.referralCode
    : `JK${tail}`;
}

export default async function ProfilePage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/profile");

  await connectDB();
  const user = await User.findById(session.userId).select("-passwordHash");
  if (!user) redirect("/login?next=/dashboard/profile");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">My Profile</h1>
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          mobile: user.mobile || "",
          memberId: memberIdFrom(user),
          dateOfBirth: user.dateOfBirth || "",
          address: user.address || "",
        }}
      />
    </div>
  );
}
