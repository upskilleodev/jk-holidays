import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "Settings",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Settings"
      description="Manage account preferences and security."
      actionHref="/dashboard/profile"
      actionLabel="My profile"
    />
  );
}
