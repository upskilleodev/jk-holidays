"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { startNavigation, toast } from "@/components/feedback/toast";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            name: String(form.get("name") || ""),
            email: String(form.get("email") || ""),
            password: String(form.get("password") || ""),
            referralCode: String(form.get("referralCode") || ""),
          }
        : {
            email: String(form.get("email") || ""),
            password: String(form.get("password") || ""),
          };

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      const message = data.error || "Something went wrong";
      setError(message);
      toast(message, "error");
      return;
    }

    toast(
      mode === "signup" ? "Account created. Welcome!" : "Signed in successfully",
      "success",
    );
    startNavigation(mode === "signup" ? "Opening dashboard…" : "Taking you in…");
    if (data.user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push(next);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" ? (
        <div>
          <label className="text-sm font-semibold text-navy">Full Name</label>
          <input
            name="name"
            required
            placeholder="Your name"
            className="input-field mt-1"
          />
        </div>
      ) : null}

      <div>
        <label className="text-sm font-semibold text-navy">Email</label>
        <div className="relative mt-1">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="input-field input-with-icon"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-navy">Password</label>
        <div className="relative mt-1">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={6}
            placeholder="Password"
            className="input-field input-with-icon input-with-icon-end"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-muted-foreground"
            aria-label="Toggle password"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mode === "signup" ? (
        <div>
          <label className="text-sm font-semibold text-navy">
            Referral code (optional)
          </label>
          <input
            name="referralCode"
            placeholder="Referral code"
            className="input-field mt-1"
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary h-12 w-full"
      >
        {loading
          ? "Please wait..."
          : mode === "signup"
            ? "Create Account"
            : "Login"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already a member?{" "}
            <Link href="/login" className="font-semibold text-blue-600">
              Login
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-blue-600">
              Join membership
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
