"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowDownToLine,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  Crown,
  ExternalLink,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Plane,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ProfileMenu } from "@/components/auth/ProfileMenu";
import { startNavigation, toast } from "@/components/feedback/toast";
import { cn } from "@/lib/utils";

type BadgeKey = "requests" | "notifications" | "tickets";

const links: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badgeKey?: BadgeKey;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Members", icon: Users },
  { href: "/admin/packages", label: "Membership Plans", icon: Crown },
  {
    href: "/admin/purchases",
    label: "Holiday Requests",
    icon: Plane,
    badgeKey: "requests",
  },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/resorts", label: "Resorts", icon: Building2 },
  { href: "/admin/wallet", label: "Wallet & Transactions", icon: Wallet },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowDownToLine },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: Bell,
    badgeKey: "notifications",
  },
  { href: "/admin/roles", label: "Admins & Roles", icon: ShieldCheck },
  {
    href: "/admin/tickets",
    label: "Support Tickets",
    icon: LifeBuoy,
    badgeKey: "tickets",
  },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminShell({
  name,
  badges = {},
  children,
}: {
  name: string;
  badges?: Partial<Record<BadgeKey, number>>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Signed out", "info");
    startNavigation("Signing out…");
    window.location.href = "/login?tab=admin";
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-navy-gradient px-5 py-5">
        <Logo />
        <div className="mt-1 text-[10px] font-bold tracking-widest text-gold">
          ADMIN PANEL
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          const active = isActive(pathname, link.href, link.exact);
          const Icon = link.icon;
          const badge = link.badgeKey ? badges[link.badgeKey] : undefined;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                active
                  ? "bg-gold-gradient text-navy-deep font-semibold"
                  : "hover:bg-white/5 hover:text-gold",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{link.label}</span>
              {badge && badge > 0 ? (
                <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 hover:text-gold"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 bg-navy-deep text-white/85 lg:block">
        {Sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-white px-4 md:px-6">
          <div className="text-sm font-semibold text-navy">Admin Console</div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/notifications"
              className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              title="Notifications"
            >
              <Bell className="h-4 w-4 text-navy" />
              {(badges.notifications || 0) > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {badges.notifications}
                </span>
              ) : null}
            </Link>
            <Link
              href="/"
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              title="Go to website"
            >
              <ExternalLink className="h-4 w-4 text-navy" />
            </Link>
            <ProfileMenu
              name={name}
              subtitle="Super Admin"
              redirectTo="/login?tab=admin"
              variant="light"
              links={[
                { href: "/admin", label: "Dashboard" },
                { href: "/admin/purchases", label: "Holiday Requests" },
                { href: "/admin/settings", label: "Settings" },
              ]}
            />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5 text-navy" />
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 bg-[oklch(0.97_0.01_260)] p-4 md:p-6">
          {children}
        </main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-label="Close overlay"
          />
          <div className="absolute inset-y-0 right-0 w-72 bg-navy-deep text-white shadow-xl">
            <button
              type="button"
              className="absolute left-3 top-3 z-10"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </div>
        </div>
      ) : null}
    </div>
  );
}
