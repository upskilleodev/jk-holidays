import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "Documents",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Documents"
      description="Access membership documents and invoices."
      actionHref="/dashboard/membership"
      actionLabel="My membership"
    />
  );
}
