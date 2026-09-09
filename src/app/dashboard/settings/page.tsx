import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { User } from "@/models/User";
import {
  SettingsForm,
  type SettingsValues,
} from "@/components/dashboard/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/settings");

  await connectDB();
  const user = await User.findById(session.userId).select(
    "language currency notifyEmail notifySms notifyOffers role",
  );
  if (!user || user.role !== "user") {
    redirect("/login?next=/dashboard/settings");
  }

  const initial: SettingsValues = {
    language: (user.language === "Hindi" ? "Hindi" : "English") as
      | "English"
      | "Hindi",
    currency: (["INR", "USD", "AED"].includes(user.currency || "")
      ? user.currency
      : "INR") as SettingsValues["currency"],
    notifyEmail: user.notifyEmail !== false,
    notifySms: user.notifySms !== false,
    notifyOffers: user.notifyOffers !== false,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage password, language, and notification preferences.
        </p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  );
}
