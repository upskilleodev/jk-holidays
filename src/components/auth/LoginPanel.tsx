"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, User } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { cn } from "@/lib/utils";

type Tab = "member" | "admin";

function LoginPanelInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab: Tab =
    searchParams.get("tab") === "admin" ? "admin" : "member";
  const [tab, setTab] = useState<Tab>(urlTab);

  useEffect(() => {
    setTab(urlTab);
  }, [urlTab]);

  function select(next: Tab) {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "admin") params.set("tab", "admin");
    else params.delete("tab");
    const qs = params.toString();
    router.replace(qs ? `/login?${qs}` : "/login", { scroll: false });
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-gold text-gold">
          {tab === "admin" ? (
            <Shield className="h-6 w-6" />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold text-navy">
          {tab === "admin" ? "ADMIN LOGIN" : "MEMBERSHIP LOGIN"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {tab === "admin"
            ? "Sign in to manage plans, orders, and cashback"
            : "Login to access your account"}
        </p>
      </div>

      <div
        className="mt-6 grid grid-cols-2 rounded-lg bg-muted p-1"
        role="tablist"
        aria-label="Login type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "member"}
          onClick={() => select("member")}
          className={cn(
            "rounded-md px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition",
            tab === "member"
              ? "bg-navy text-white shadow-sm"
              : "text-muted-foreground hover:text-navy",
          )}
        >
          Member Login
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "admin"}
          onClick={() => select("admin")}
          className={cn(
            "rounded-md px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition",
            tab === "admin"
              ? "bg-navy text-white shadow-sm"
              : "text-muted-foreground hover:text-navy",
          )}
        >
          Admin Login
        </button>
      </div>

      <div className="mt-6">
        {tab === "member" ? (
          <AuthForm mode="login" />
        ) : (
          <AdminLoginForm embedded />
        )}
      </div>
    </div>
  );
}

export function LoginPanel() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-sm text-muted-foreground shadow-2xl">
          Loading...
        </div>
      }
    >
      <LoginPanelInner />
    </Suspense>
  );
}
