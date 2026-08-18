"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Eye,
  KeyRound,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "@/components/feedback/toast";
import { formatINR } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  memberId: string;
  referralPoints: number;
  purchaseStatus?: string | null;
  joinedAt: string;
};

type Tab = "credentials" | "points" | "password" | "delete";

export function MemberManagePanel(props: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("credentials");
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(String(props.referralPoints || 0));
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPoints(String(props.referralPoints || 0));
    setNote("");
    setPassword("");
    setConfirmPassword("");
    setRevealedPassword(null);
    setTab("credentials");
  }, [open, props.referralPoints]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, loading]);

  const credentials = useMemo(
    () => [
      { label: "Member ID", value: props.memberId },
      { label: "Full name", value: props.name },
      { label: "Login email", value: props.email },
      { label: "Referral code", value: props.referralCode },
      {
        label: "Referral points",
        value: formatINR(props.referralPoints || 0),
      },
      {
        label: "Membership",
        value: props.purchaseStatus || "No purchase",
      },
      {
        label: "Joined",
        value: new Date(props.joinedAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      },
      { label: "Password", value: "•••••••• (hashed — set a new one to share)" },
    ],
    [props],
  );

  async function copyValue(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast("Copied", "success");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast("Could not copy", "error");
    }
  }

  async function savePoints() {
    const value = Number(points);
    if (!Number.isFinite(value) || value < 0) {
      toast("Enter a valid points amount", "error");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/users/${props.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referralPoints: value,
        note: note.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error || "Could not update points", "error");
      return;
    }
    toast("Referral points updated", "success");
    setOpen(false);
    router.refresh();
  }

  async function savePassword() {
    if (password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/users/${props.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error || "Could not set password", "error");
      return;
    }
    setRevealedPassword(data.password || password);
    setPassword("");
    setConfirmPassword("");
    toast("Login password updated — copy it now", "success");
  }

  async function deleteUser() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${props.id}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error || "Could not delete user", "error");
      return;
    }
    toast(`${props.name} deleted`, "success");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold text-navy hover:border-gold hover:bg-cream/50"
      >
        <Eye className="h-3.5 w-3.5" />
        Manage
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
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-white p-5 shadow-xl"
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

            <div className="flex items-center gap-3 pr-8">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                {props.name.trim().charAt(0).toUpperCase() || "M"}
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">
                  {props.name}
                </h2>
                <p className="text-xs text-muted-foreground">{props.memberId}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ["credentials", "Credentials"],
                  ["points", "Set points"],
                  ["password", "Password"],
                  ["delete", "Delete"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    tab === key
                      ? "bg-navy text-white"
                      : "bg-muted text-navy hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "credentials" ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Login email and account details for this member. Passwords are
                  hashed — use the Password tab to set a new one you can share.
                </p>
                {credentials.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        {row.label}
                      </div>
                      <div className="mt-0.5 break-all text-sm font-medium text-navy">
                        {row.value}
                      </div>
                    </div>
                    {!row.value.includes("hashed") ? (
                      <button
                        type="button"
                        onClick={() => copyValue(row.value, row.label)}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-navy"
                        aria-label={`Copy ${row.label}`}
                      >
                        {copied === row.label ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {tab === "points" ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4 text-gold" />
                  Current balance:{" "}
                  <span className="font-semibold text-navy">
                    {formatINR(props.referralPoints || 0)}
                  </span>
                </div>
                <label className="block text-sm font-semibold text-navy">
                  Set referral points (₹)
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="input-field mt-1.5"
                    placeholder="e.g. 2500"
                  />
                </label>
                <label className="block text-sm font-semibold text-navy">
                  Note (optional)
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="input-field mt-1.5"
                    placeholder="Reason for adjustment"
                  />
                </label>
                <button
                  type="button"
                  disabled={loading}
                  onClick={savePoints}
                  className="btn-navy w-full disabled:opacity-55"
                >
                  {loading ? "Saving…" : "Save referral points"}
                </button>
              </div>
            ) : null}

            {tab === "password" ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-2 rounded-xl bg-cream/60 p-3 text-sm text-muted-foreground">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  Existing passwords cannot be revealed. Set a temporary
                  password, copy it, and share it securely with the member.
                </div>
                <label className="block text-sm font-semibold text-navy">
                  New password
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field mt-1.5"
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                </label>
                <label className="block text-sm font-semibold text-navy">
                  Confirm password
                  <input
                    type="text"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field mt-1.5"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </label>
                <button
                  type="button"
                  disabled={loading}
                  onClick={savePassword}
                  className="btn-navy w-full disabled:opacity-55"
                >
                  {loading ? "Updating…" : "Set login password"}
                </button>
                {revealedPassword ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                      New password (copy now)
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <code className="break-all text-sm font-semibold text-navy">
                        {revealedPassword}
                      </code>
                      <button
                        type="button"
                        onClick={() =>
                          copyValue(revealedPassword, "new-password")
                        }
                        className="shrink-0 rounded-md p-1.5 hover:bg-white"
                      >
                        {copied === "new-password" ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-emerald-800">
                      Login: {props.email}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {tab === "delete" ? (
              <div className="mt-5 space-y-4">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-danger">
                  <Trash2 className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Permanently remove{" "}
                  <span className="font-semibold text-navy">{props.name}</span>{" "}
                  ({props.email}), their purchase, and related cashback
                  records. This cannot be undone.
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={deleteUser}
                  className="inline-flex h-11 w-full items-center justify-center rounded-md bg-danger px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-55"
                >
                  {loading ? "Deleting…" : "Yes, delete member"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
