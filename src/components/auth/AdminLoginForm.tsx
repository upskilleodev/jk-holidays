"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { startNavigation, toast } from "@/components/feedback/toast";

export function AdminLoginForm({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      const message = data.error || "Invalid credentials";
      setError(message);
      toast(message, "error");
      return;
    }

    if (data.user?.role !== "admin") {
      // Login API already wrote a member cookie for this account — clear only that.
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "member" }),
      });
      const message = "This account is not an admin. Use member login instead.";
      setError(message);
      toast(message, "error");
      return;
    }

    toast("Admin signed in", "success");
    startNavigation("Opening admin…");
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-navy">Admin Email</label>
        <div className="relative mt-1">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="email"
            type="email"
            required
            placeholder="Admin email"
            className="input-field input-with-icon"
            autoComplete="username"
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
            autoComplete="current-password"
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button type="submit" disabled={loading} className="btn-primary h-12 w-full">
        {loading ? "Signing in..." : "Login"}
      </button>

      {embedded ? null : (
        <p className="text-center text-sm text-muted-foreground">
          Member account?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Go to member login
          </Link>
        </p>
      )}
    </form>
  );
}
