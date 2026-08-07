"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { startNavigation, toast } from "@/components/feedback/toast";

type MenuLink = {
  href: string;
  label: string;
};

type Props = {
  name: string;
  subtitle?: string;
  redirectTo?: string;
  links?: MenuLink[];
  variant?: "dark" | "light";
};

export function ProfileMenu({
  name,
  subtitle = "Member",
  redirectTo = "/login",
  links = [],
  variant = "dark",
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (name.trim().charAt(0) || "U").toUpperCase();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Signed out", "info");
    startNavigation("Signing out…");
    window.location.href = redirectTo;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-full p-0.5 transition",
          variant === "dark" ? "hover:bg-white/10" : "hover:bg-muted",
        )}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-gradient font-bold text-navy-deep">
          {initial}
        </span>
        <span className="hidden text-left text-xs leading-tight sm:block">
          <span
            className={cn(
              "block font-semibold",
              variant === "dark" ? "text-white" : "text-navy",
            )}
          >
            {name}
          </span>
          <span
            className={cn(
              variant === "dark" ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 sm:block",
            variant === "dark" ? "text-white/70" : "text-muted-foreground",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-white py-1 text-navy shadow-lg"
        >
          <div className="border-b px-3 py-2 sm:hidden">
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            disabled={loading}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive hover:bg-muted disabled:opacity-55"
          >
            <LogOut className="h-4 w-4" />
            {loading ? "Signing out..." : "Logout"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
