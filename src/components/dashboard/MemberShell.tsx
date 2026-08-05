"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Crown,
  Gift,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/packages", label: "Browse Plans", icon: Package },
  { href: "/packages", label: "My Membership", icon: Crown },
  { href: "/signup", label: "Refer & Earn", icon: Users },
];

type Props = {
  name: string;
  referralCode: string;
  children: React.ReactNode;
};

export function MemberShell({ name, referralCode, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-navy-gradient px-5 py-5">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href) && item.label !== "Refer & Earn";
          const Icon = item.icon;
          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-gold-gradient text-navy-deep font-semibold"
                  : "hover:bg-white/5 hover:text-gold",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
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
          Share code <span className="font-bold text-white">{referralCode}</span>
        </p>
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="mt-3 block w-full rounded-md bg-gold-gradient py-1.5 text-center text-xs font-bold text-navy-deep"
        >
          View Rewards
        </Link>
      </div>
      <div className="border-t border-white/10 p-3 text-xs text-white/50">
        {name}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 bg-navy-deep text-white/85 lg:block">
        {Sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b bg-navy-gradient px-4 text-white md:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="hidden lg:block text-sm font-semibold">
              Member Portal
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gold-gradient font-bold text-navy-deep">
              {name.charAt(0)}
            </div>
            <div className="hidden text-xs leading-tight sm:block">
              <div className="font-semibold">{name}</div>
              <div className="text-white/70">Member</div>
            </div>
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
          <div className="absolute inset-y-0 left-0 w-72 bg-navy-deep text-white">
            <button
              type="button"
              className="absolute right-3 top-3"
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
