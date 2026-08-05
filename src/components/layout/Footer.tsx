import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/packages", label: "Membership Plans" },
  { href: "/destinations", label: "Destinations" },
  { href: "/offers", label: "Offers" },
  { href: "/#how", label: "How It Works" },
  { href: "/contact", label: "Contact Us" },
];

const memberLinks = [
  { href: "/login", label: "Membership Login" },
  { href: "/signup", label: "Join Membership" },
  { href: "/dashboard", label: "My Account" },
  { href: "/packages", label: "Browse Plans" },
  { href: "/login?tab=admin", label: "Admin Login" },
];

const supportLinks = [
  { href: "/contact", label: "Book Presentation" },
  { href: "/contact", label: "Help & Support" },
];

const social = [
  { href: site.social.facebook, label: "f", name: "Facebook" },
  { href: site.social.instagram, label: "i", name: "Instagram" },
  { href: site.social.youtube, label: "y", name: "YouTube" },
];

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 font-display text-lg text-white">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="hover:text-gold">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-gradient text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-4 text-sm">{site.description}</p>
          <div className="mt-4 flex gap-2">
            {social.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.name}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-xs hover:border-gold hover:text-gold"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <FooterCol title="Quick Links" items={quickLinks} />
        <FooterCol title="Member Services" items={memberLinks} />
        <FooterCol title="Support" items={supportLinks} />
        <div>
          <h4 className="mb-4 font-display text-lg text-white">Contact Us</h4>
          <p className="text-sm whitespace-pre-line">{site.address}</p>
          <p className="mt-3 text-sm">
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} JK Holidays Pvt. Ltd. All Rights Reserved.
      </div>
    </footer>
  );
}
