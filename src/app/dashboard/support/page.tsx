import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "Travel Support",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Travel Support"
      description="Get help from our travel concierge team."
      actionHref="/contact"
      actionLabel="Contact support"
    />
  );
}
