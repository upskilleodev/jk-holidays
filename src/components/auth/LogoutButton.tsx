"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { startNavigation, toast } from "@/components/feedback/toast";

type Props = {
  className?: string;
  redirectTo?: string;
  label?: string;
  iconOnly?: boolean;
  /** Which session to clear — keeps the other role logged in. */
  scope?: "member" | "admin" | "all";
};

export function LogoutButton({
  className,
  redirectTo = "/",
  label = "Logout",
  iconOnly = false,
  scope = "all",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope }),
    });
    toast("Signed out", "info");
    startNavigation("Signing out…");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 disabled:opacity-55",
        className,
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {iconOnly ? null : (
        <span>{loading ? "Signing out..." : label}</span>
      )}
    </button>
  );
}
