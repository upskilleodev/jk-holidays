import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "My Profile",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="My Profile"
      description="Update your personal details and contact preferences."
      actionHref="/dashboard/settings"
      actionLabel="Open settings"
    />
  );
}
