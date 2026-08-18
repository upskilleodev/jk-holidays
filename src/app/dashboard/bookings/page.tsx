import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "My Bookings",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="My Bookings"
      description="Track upcoming and past holiday bookings."
      actionHref="/dashboard/request"
      actionLabel="Request a holiday"
    />
  );
}
