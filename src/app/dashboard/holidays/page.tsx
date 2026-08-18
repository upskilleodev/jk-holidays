import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "Available Holidays",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Available Holidays"
      description="Browse destinations and holiday options for members."
      actionHref="/destinations"
      actionLabel="Explore destinations"
    />
  );
}
