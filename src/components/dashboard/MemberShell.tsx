"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Building2,
  CalendarCheck,
  Crown,
  FileText,
  Gift,
  Headphones,
  LayoutGrid,
  LogOut,
  Menu,
  Phone,
  Plane,
  Settings,
  Tag,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ProfileMenu } from "@/components/auth/ProfileMenu";
import { startNavigation, toast } from "@/components/feedback/toast";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/dashboard/membership", label: "My Membership", icon: Crown },
  { href: "/dashboard/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/dashboard/request", label: "Request Holiday", icon: Plane },
  { href: "/dashboard/holidays", label: "Available Holidays", icon: Plane },
  { href: "/dashboard/resorts", label: "Resorts Directory", icon: Building2 },
  { href: "/dashboard/wallet", label: "My Wallet", icon: Wallet },
  { href: "/dashboard/refer", label: "Refer & Earn", icon: Users },
  { href: "/dashboard/rewards", label: "My Rewards", icon: Gift },
  { href: "/dashboard/offers", label: "Offers & Discounts", icon: Tag },
  { href: "/dashboard/support", label: "Travel Support", icon: Headphones },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    badge: 2,
  },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

type Props = {
  name: string;
  memberId: string;
  referralCode: string;
  children: React.ReactNode;
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MemberShell({
  name,
  memberId,
  referralCode,
  children,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "member" }),
    });
    toast("Signed out", "info");
    startNavigation("Signing out…");
    window.location.href = "/login";
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-navy-gradient px-5 py-4">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo size="sm" />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = isActive(
            pathname,
            item.href,
            "exact" in item ? item.exact : false,
          );
          const Icon = item.icon;
          const badge = "badge" in item ? item.badge : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-gold-gradient font-semibold text-navy-deep"
                  : "hover:bg-white/5 hover:text-gold",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {badge ? (
                <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {badge}
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
      <div className="m-3 rounded-xl border border-gold/40 bg-white/5 p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold text-gold">
          <Gift className="h-4 w-4" /> Refer & Earn
        </div>
        <p className="mt-1 text-xs text-white/70">
          Share code{" "}
          <span className="font-bold text-white">{referralCode}</span> and earn
          rewards.
        </p>
        <Link
          href="/dashboard/refer"
          onClick={() => setOpen(false)}
          className="mt-3 block w-full rounded-md bg-gold-gradient py-1.5 text-center text-xs font-bold text-navy-deep"
        >
          REFER NOW
        </Link>
      </div>
      <div className="border-t border-white/10 p-3 text-xs text-white/50">
        {name} · {memberId}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 bg-navy-deep text-white/85 lg:block">
        {Sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/10 bg-navy-gradient px-4 text-white md:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-2 text-sm md:flex"
            >
              <Phone className="h-4 w-4 text-gold" />
              {site.phone}
            </a>
            <Link
              href="/dashboard/support"
              className="hidden items-center gap-2 text-sm md:flex"
            >
              <Headphones className="h-4 w-4 text-gold" />
              Support
            </Link>
            <Link
              href="/dashboard/notifications"
              className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold">
                2
              </span>
            </Link>
            <ProfileMenu
              name={name}
              subtitle={`Member ID: ${memberId}`}
              redirectTo="/login"
              scope="member"
              links={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/dashboard/profile", label: "My Profile" },
                { href: "/dashboard/membership", label: "My Membership" },
                { href: "/packages", label: "Browse Plans" },
              ]}
            />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
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
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-navy-deep text-white shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 z-10"
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
