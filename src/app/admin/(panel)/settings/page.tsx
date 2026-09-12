import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SiteContactForm } from "@/components/admin/SiteContactForm";
import { getSiteContact } from "@/lib/site-settings";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
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

export default async function AdminSettingsPage() {
  const contact = await getSiteContact();

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Quick links for brand ops and program configuration."
      />
      <div className="mb-4 text-sm font-semibold text-navy">{site.name}</div>
      <SiteContactForm initial={contact} />
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
