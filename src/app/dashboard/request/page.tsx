import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "Request Holiday",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Request Holiday"
      description="Submit a holiday request against your membership entitlement."
      actionHref="/dashboard/holidays"
      actionLabel="See available holidays"
    />
  );
}
