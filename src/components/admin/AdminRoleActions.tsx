"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2, X } from "lucide-react";
import { toast } from "@/components/feedback/toast";

type Props = {
  id: string;
  name: string;
  email: string;
  isSelf: boolean;
};

export function AdminRoleActions({ id, name, email, isSelf }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "delete" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mode]);

  async function onSavePassword(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not update password");
      return;
    }

    toast(`Password updated for ${email}`, "success");
    setPassword("");
    setMode(null);
    router.refresh();
  }

  async function onDelete() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not remove admin");
      return;
    }

    toast(`${email} removed`, "success");
    setMode(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setPassword("");
            setError("");
            setMode("password");
          }}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold uppercase tracking-wide text-navy hover:bg-muted"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Password
        </button>
        <button
          type="button"
          disabled={isSelf}
          title={isSelf ? "You cannot remove yourself" : "Remove admin"}
          onClick={() => {
            setError("");
            setMode("delete");
          }}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-danger/30 px-3 text-xs font-semibold uppercase tracking-wide text-danger hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      {mode === "password" ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/50 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={() => !loading && setMode(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl"
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => setMode(null)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="pr-8 font-display text-2xl font-bold text-navy">
              Reset password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>

            <form onSubmit={onSavePassword} className="mt-5 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
                  New password
                </span>
                <input
                  className="input-field"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {error ? <p className="text-sm text-danger">{error}</p> : null}

              <div className="grid gap-2 pt-1 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setMode(null)}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-navy hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-navy !h-11"
                >
                  {loading ? "Saving…" : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {mode === "delete" ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/50 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={() => !loading && setMode(null)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl"
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => setMode(null)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-danger">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-navy">
              Remove admin?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This removes admin access for{" "}
              <span className="font-semibold text-navy">{name || email}</span>.
              They will no longer be able to sign in to the admin console.
            </p>
            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setMode(null)}
                className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-navy hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onDelete}
                className="inline-flex h-11 items-center justify-center rounded-md bg-danger px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-55"
              >
                {loading ? "Removing…" : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
