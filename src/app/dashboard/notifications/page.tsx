import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "Notifications",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Notifications"
      description="Stay updated on bookings, rewards, and announcements."
      actionHref="/dashboard"
      actionLabel="Back to dashboard"
    />
  );
}
