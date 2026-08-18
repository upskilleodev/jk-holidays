import { PortalPlaceholder } from "@/components/portal/PortalPlaceholder";

export const metadata = {
  title: "My Rewards",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="My Rewards"
      description="Redeem cashback and member rewards."
      actionHref="/dashboard/wallet"
      actionLabel="Open wallet"
    />
  );
}
