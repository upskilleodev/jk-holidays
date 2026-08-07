"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { toast } from "@/components/feedback/toast";

type Props = {
  id: string;
  name: string;
  email: string;
};

export function DeleteUserButton({ id, name, email }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  async function onConfirm() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Could not delete user", "error");
      return;
    }

    toast(`${name} deleted`, "success");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-danger/30 px-3 text-xs font-semibold uppercase tracking-wide text-danger hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
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
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            aria-describedby="delete-user-desc"
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

            <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-danger">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2
              id="delete-user-title"
              className="mt-4 font-display text-2xl font-bold text-navy"
            >
              Delete this member?
            </h2>
            <p id="delete-user-desc" className="mt-2 text-sm text-muted-foreground">
              This will permanently remove{" "}
              <span className="font-semibold text-navy">{name}</span> (
              {email}) along with their purchase request and related cashback
              records. This cannot be undone.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-navy hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className="inline-flex h-11 items-center justify-center rounded-md bg-danger px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-55"
              >
                {loading ? "Deleting…" : "Yes, delete user"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
