"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "@/components/feedback/toast";
import { cn, formatINR } from "@/lib/utils";

export type AdminWithdrawalRow = {
  id: string;
  requestId: string;
  memberName: string;
  memberEmail: string;
  memberPoints: number;
  amount: number;
  method: "bank" | "upi";
  accountDetails: string;
  remarks: string;
  status: "pending" | "approved" | "rejected" | "paid";
  adminNote: string;
  createdAt: string;
};

const statusStyle: Record<AdminWithdrawalRow["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  paid: "bg-sky-100 text-sky-700",
};

type Filter = "all" | AdminWithdrawalRow["status"];

export function AdminWithdrawalsPanel({
  withdrawals,
}: {
  withdrawals: AdminWithdrawalRow[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const counts = useMemo(
    () => ({
      all: withdrawals.length,
      pending: withdrawals.filter((w) => w.status === "pending").length,
      approved: withdrawals.filter((w) => w.status === "approved").length,
      rejected: withdrawals.filter((w) => w.status === "rejected").length,
      paid: withdrawals.filter((w) => w.status === "paid").length,
    }),
    [withdrawals],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return withdrawals;
    return withdrawals.filter((w) => w.status === filter);
  }, [withdrawals, filter]);

  const selected = withdrawals.find((w) => w.id === selectedId) || null;

  function openReview(row: AdminWithdrawalRow) {
    setSelectedId(row.id);
    setNote(row.adminNote || "");
  }

  async function setStatus(next: "approved" | "rejected" | "paid") {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(`/api/admin/withdrawals/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, adminNote: note }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error || "Could not update withdrawal", "error");
      return;
    }
    toast(
      next === "rejected"
        ? "Withdrawal rejected"
        : next === "paid"
          ? "Marked as paid"
          : "Withdrawal approved",
      next === "rejected" ? "info" : "success",
    );
    setSelectedId(null);
    router.refresh();
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "rejected", label: "Rejected", count: counts.rejected },
    { key: "paid", label: "Paid", count: counts.paid },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Withdrawals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dashboard › Withdrawals
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold",
              filter === tab.key
                ? "border-navy bg-navy text-white"
                : "border-border bg-white text-navy hover:bg-muted",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                filter === tab.key ? "bg-white/20" : "bg-muted",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">Request ID</th>
                <th className="pr-3">Member</th>
                <th className="pr-3">Amount</th>
                <th className="pr-3">Method</th>
                <th className="pr-3">Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No withdrawals in this section.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="py-3 pr-3 font-mono text-xs">
                      {w.requestId}
                    </td>
                    <td className="pr-3 font-medium text-navy">
                      {w.memberName}
                    </td>
                    <td className="pr-3">{formatINR(w.amount)}</td>
                    <td className="pr-3 capitalize">{w.method}</td>
                    <td className="pr-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          statusStyle[w.status],
                        )}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => openReview(w)}
                        className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-xs font-semibold text-navy hover:bg-muted"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/50"
            aria-label="Close"
            onClick={() => !loading && setSelectedId(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl">
            <button
              type="button"
              disabled={loading}
              onClick={() => setSelectedId(null)}
              className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-xs text-muted-foreground">Review request</div>
            <h2 className="font-display text-2xl font-bold text-navy">
              {selected.requestId}
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl bg-muted/70 p-3">
                <div className="font-semibold text-navy">Member</div>
                <div className="mt-1 text-muted-foreground">
                  {selected.memberName}
                </div>
                <div className="text-muted-foreground">
                  {selected.memberEmail}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Wallet balance: {formatINR(selected.memberPoints)}
                </div>
              </div>
              <div className="rounded-xl bg-muted/70 p-3">
                <div className="font-semibold text-navy">Payout</div>
                <div className="mt-1 text-muted-foreground">
                  Amount: {formatINR(selected.amount)}
                </div>
                <div className="text-muted-foreground capitalize">
                  Method: {selected.method}
                </div>
                <div className="mt-1 break-all text-muted-foreground">
                  {selected.accountDetails}
                </div>
                {selected.remarks ? (
                  <div className="mt-1 text-muted-foreground">
                    Remarks: {selected.remarks}
                  </div>
                ) : null}
              </div>
              <label className="block text-sm font-semibold text-navy">
                Admin note
                <textarea
                  className="input-field mt-1 min-h-20 resize-none"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note for this review"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selected.status === "pending" ? (
                <>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setStatus("approved")}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setStatus("rejected")}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-rose-600 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              ) : null}
              {selected.status === "approved" ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStatus("paid")}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-gold-gradient text-sm font-bold text-navy-deep disabled:opacity-60"
                >
                  Mark as paid
                </button>
              ) : null}
              {selected.status === "rejected" || selected.status === "paid" ? (
                <p className="w-full text-center text-sm text-muted-foreground capitalize">
                  This request is {selected.status}.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
