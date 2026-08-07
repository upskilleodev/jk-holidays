"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "@/components/feedback/toast";

export function AddAdminButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({ email: "", password: "" });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function reset() {
    setValues({ email: "", password: "" });
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not add admin");
      return;
    }

    toast(`Admin created for ${values.email}`, "success");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <button type="button" className="btn-navy" onClick={() => setOpen(true)}>
        + Add Admin
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/50 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={() => !loading && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-admin-title"
            className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl"
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h2
              id="add-admin-title"
              className="pr-8 font-display text-2xl font-bold text-navy"
            >
              Add admin
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter an email and password. They can sign in to the admin console
              right away.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
                  Email
                </span>
                <input
                  className="input-field"
                  type="email"
                  required
                  autoComplete="off"
                  value={values.email}
                  onChange={(e) =>
                    setValues({ ...values, email: e.target.value })
                  }
                  placeholder="admin2@jkholidays.com"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
                  Password
                </span>
                <input
                  className="input-field"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) =>
                    setValues({ ...values, password: e.target.value })
                  }
                  placeholder="Min. 6 characters"
                />
              </label>

              {error ? <p className="text-sm text-danger">{error}</p> : null}

              <div className="grid gap-2 pt-1 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-navy hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-navy !h-11"
                >
                  {loading ? "Saving…" : "Add admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
