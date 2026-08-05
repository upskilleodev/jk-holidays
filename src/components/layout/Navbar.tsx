"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ProfileMenu } from "@/components/auth/ProfileMenu";
import { site } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/destinations", label: "Destinations" },
  { href: "/offers", label: "Offers" },
  { href: "/contact", label: "Contact Us" },
];

const membershipLinks = [
  { href: "/membership", label: "Membership" },
  { href: "/packages", label: "Browse Plans" },
];

type Props = {
  user?: {
    name: string;
    role: "user" | "admin";
  } | null;
};

export function Navbar({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [membershipOpen, setMembershipOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.body.classList.toggle("menu-open", open);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMembershipOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy-gradient text-white shadow-md safe-top">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-6 px-4">
          <Link href="/" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold tracking-wide lg:flex">
            {links.slice(0, 2).map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-gold uppercase">
                {l.label}
              </Link>
            ))}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-gold uppercase"
                onClick={() => setMembershipOpen((v) => !v)}
              >
                Membership <ChevronDown className="h-4 w-4" />
              </button>
              {membershipOpen ? (
                <div className="absolute left-0 top-full z-50 mt-2 min-w-[11rem] rounded-md border border-border bg-white p-1 text-navy shadow-lg">
                  {membershipLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block rounded px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setMembershipOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            {links.slice(2).map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-gold uppercase">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="hidden xl:flex items-center gap-2 text-sm"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-gold text-gold">
                <Phone className="h-4 w-4" />
              </span>
              {site.phone}
            </a>
            {user?.role === "admin" ? (
              <ProfileMenu
                name={user.name}
                subtitle="Admin"
                redirectTo="/login?tab=admin"
                links={[
                  { href: "/admin", label: "Admin Panel" },
                  { href: "/", label: "View Website" },
                ]}
              />
            ) : user?.role === "user" ? (
              <ProfileMenu
                name={user.name}
                subtitle="Member"
                redirectTo="/login"
                links={[
                  { href: "/dashboard", label: "My Account" },
                  { href: "/packages", label: "Browse Plans" },
                ]}
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold uppercase tracking-wide hover:text-gold"
                >
                  Login
                </Link>
                <Link href="/contact" className="btn-primary !h-9 !px-4">
                  Book Presentation
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="lg:hidden fixed inset-0 z-[60] bg-navy text-white safe-top safe-bottom">
          <div className="flex h-full min-h-dvh flex-col">
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
              <Logo />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-4 flex flex-col gap-1 px-4 text-sm font-semibold">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="min-h-12 flex items-center hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/membership"
                className="min-h-12 flex items-center hover:text-gold"
                onClick={() => setOpen(false)}
              >
                Membership
              </Link>
              <Link
                href="/packages"
                className="min-h-12 flex items-center hover:text-gold"
                onClick={() => setOpen(false)}
              >
                All Plans
              </Link>
              {user?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="min-h-12 flex items-center hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  Admin Panel
                </Link>
              ) : user?.role === "user" ? (
                <Link
                  href="/dashboard"
                  className="min-h-12 flex items-center hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  My Account
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="min-h-12 flex items-center hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  Member Login
                </Link>
              )}
            </nav>
            <div className="mt-auto space-y-3 p-4 pb-8">
              {user ? (
                <LogoutButton
                  redirectTo={
                    user.role === "admin" ? "/login?tab=admin" : "/login"
                  }
                  className="btn-ghost w-full"
                />
              ) : null}
              <Link
                href="/contact"
                className="btn-primary w-full"
                onClick={() => setOpen(false)}
              >
                Book Presentation
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
