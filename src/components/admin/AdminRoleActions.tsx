"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "@/components/feedback/toast";

export type AdminRoleValue = "super_admin" | "operations" | "support";

type Props = {
  id: string;
  name: string;
  email: string;
  adminRole: AdminRoleValue;
  adminStatus: "active" | "invite_pending";
  isSelf: boolean;
};

export function AdminRoleActions({
  id,
  name,
  email,
  adminRole,
  adminStatus,
  isSelf,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    name,
    email,
    adminRole,
    adminStatus,
    password: "",
  });

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

  function openEdit() {
    setValues({
      name,
      email,
      adminRole,
      adminStatus,
      password: "",
    });
    setError("");
    setMode("edit");
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: Record<string, string> = {
      name: values.name.trim(),
      email: values.email.trim(),
      adminRole: values.adminRole,
      adminStatus: values.adminStatus,
    };
    if (values.password.trim()) payload.password = values.password.trim();

    const res = await fetch(`/api/admin/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not update admin");
      return;
    }

    toast("Admin info updated", "success");
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
      <button
        type="button"
        onClick={openEdit}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-navy hover:bg-muted"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit Info
      </button>

      {mode === "edit" ? (
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
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-white p-5 shadow-xl"
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => setMode(null)}
              className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="pr-8 font-display text-2xl font-bold text-navy">
              Edit info
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update name, role, status, or password.
            </p>

            <form onSubmit={onSave} className="mt-5 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold tracking-[0.16em] text-stone uppercase">
                  Name
                </span>
                <input
                  className="input-field"
                  required
                  minLength={2}
                  value={values.name}
                  onChange={(e) =>
                    setValues({ ...values, name: e.target.value })
                  }
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold tracking-[0.16em] text-stone uppercase">
                  Email
                </span>
                <input
                  className="input-field"
                  type="email"
                  required
                  value={values.email}
                  onChange={(e) =>
                    setValues({ ...values, email: e.target.value })
                  }
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold tracking-[0.16em] text-stone uppercase">
                  Role
                </span>
                <select
                  className="input-field"
                  value={values.adminRole}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      adminRole: e.target.value as AdminRoleValue,
                    })
                  }
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="operations">Manager</option>
                  <option value="support">Support</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold tracking-[0.16em] text-stone uppercase">
                  Status
                </span>
                <select
                  className="input-field"
                  value={values.adminStatus}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      adminStatus: e.target.value as
                        | "active"
                        | "invite_pending",
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="invite_pending">Invite pending</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold tracking-[0.16em] text-stone uppercase">
                  New password (optional)
                </span>
                <input
                  className="input-field"
                  type="password"
                  minLength={6}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) =>
                    setValues({ ...values, password: e.target.value })
                  }
                  placeholder="Leave blank to keep current"
                />
              </label>

              {error ? <p className="text-sm text-danger">{error}</p> : null}

              <div className="flex flex-wrap justify-between gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading || isSelf}
                  title={
                    isSelf ? "You cannot remove yourself" : "Remove admin"
                  }
                  onClick={() => {
                    setError("");
                    setMode("delete");
                  }}
                  className="inline-flex h-11 items-center gap-1.5 rounded-md border border-danger/30 px-3 text-sm font-semibold text-danger hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
                <div className="flex gap-2">
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
                    {loading ? "Saving…" : "Save changes"}
                  </button>
                </div>
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
              className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
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
            </p>
            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setMode("edit")}
                className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-navy hover:bg-muted"
              >
                Back
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
