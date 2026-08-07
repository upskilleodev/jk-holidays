import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { site } from "@/lib/site";

export const metadata = { title: "Settings" };

const items = [
  {
    title: "Cashback rules",
    text: "Configure referral reward type and value.",
    href: "/admin/referrals",
  },
  {
    title: "Membership plans",
    text: "Create and publish membership packages.",
    href: "/admin/packages",
  },
  {
    title: "Holiday requests",
    text: "Review and activate purchase requests.",
    href: "/admin/purchases",
  },
  {
    title: "Public website",
    text: "Open the live marketing site.",
    href: "/",
  },
];

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Quick links for brand ops and program configuration."
      />
      <div className="mb-4 mobile-card text-sm">
        <div className="font-semibold text-navy">{site.name}</div>
        <div className="mt-1 text-muted-foreground">{site.email}</div>
        <div className="text-muted-foreground">{site.phone}</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mobile-card transition hover:border-gold/40"
          >
            <div className="font-display text-lg font-bold text-navy">
              {item.title}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
