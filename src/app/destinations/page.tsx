import { SiteShell } from "@/components/layout/SiteShell";
import { HolidayTripsSection } from "@/components/home/HolidayTripsSection";

export const metadata = {
  title: "Destinations",
  description:
    "Explore our premium destinations across India and internationally.",
};

export default function DestinationsPage() {
  return (
    <SiteShell>
      <HolidayTripsSection title="Popular Holiday Packages" />
    </SiteShell>
  );
}
