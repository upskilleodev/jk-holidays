import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "Offers & Discounts",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Offers & Discounts"
      description="Exclusive member offers and seasonal discounts."
      actionHref="/offers"
      actionLabel="View public offers"
    />
  );
}
