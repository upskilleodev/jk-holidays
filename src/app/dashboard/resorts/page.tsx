import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "Resorts Directory",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Resorts Directory"
      description="Discover partner resorts across India and international destinations."
      actionHref="/destinations"
      actionLabel="View destinations"
    />
  );
}
