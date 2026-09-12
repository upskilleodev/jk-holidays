"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Search, X } from "lucide-react";
import { toast } from "@/components/feedback/toast";
import { cn, formatINR } from "@/lib/utils";
import { downloadXlsx } from "@/lib/xlsx";

export type AdminWithdrawalRow = {
  id: string;
  requestId: string;
  memberName: string;
  memberEmail: string;
  memberMobile: string;
  memberId: string;
  memberPoints: number;
  amount: number;
  method: "bank" | "upi";
  accountDetails: string;
  bank: {
    accountNumber: string;
    accountHolderName: string;
    bankName: string;
    branch: string;
    ifsc: string;
  };
  upiId: string;
  remarks: string;
  status: "pending" | "approved" | "rejected" | "paid";
  adminNote: string;
  createdAt: string;
  processedAt: string | null;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="break-all text-right font-semibold text-navy">{value}</dd>
    </div>
  );
}

function DetailCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-xl bg-muted/70 p-3">
      <div className="font-semibold text-navy">{title}</div>
      <dl className="mt-2 space-y-1 text-xs">
        {rows
          .filter(([, value]) => value && value !== "—")
          .map(([label, value]) => (
            <DetailRow key={label} label={label} value={value} />
          ))}
      </dl>
    </div>
  );
}

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
  const [q, setQ] = useState("");
  const [checked, setChecked] = useState<string[]>([]);

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
    const term = q.trim().toLowerCase();
    return withdrawals.filter((w) => {
      if (filter !== "all" && w.status !== filter) return false;
      if (!term) return true;
      return [
        w.requestId,
        w.memberName,
        w.memberEmail,
        w.memberMobile,
        w.memberId,
        w.bank.accountNumber,
        w.bank.accountHolderName,
        w.bank.bankName,
        w.bank.branch,
        w.bank.ifsc,
        w.upiId,
        w.accountDetails,
        w.status,
        String(w.amount),
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term));
    });
  }, [withdrawals, filter, q]);

  const selected = withdrawals.find((w) => w.id === selectedId) || null;
  const selectedRows = filtered.filter((w) => checked.includes(w.id));
  const allVisibleChecked =
    filtered.length > 0 && filtered.every((w) => checked.includes(w.id));

  function toggleAll() {
    setChecked(allVisibleChecked ? [] : filtered.map((w) => w.id));
  }

  function toggleOne(id: string) {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function openReview(row: AdminWithdrawalRow) {
    setSelectedId(row.id);
    setNote(row.adminNote || "");
  }

  async function bulkUpdate(status: "approved" | "rejected" | "paid") {
    if (selectedRows.length === 0) return;
    setLoading(true);
    const res = await fetch("/api/admin/withdrawals/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedRows.map((w) => w.id), status }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Could not update withdrawals", "error");
      return;
    }

    const failed = (data.failures || []).length;
    toast(
      failed
        ? `${data.updated} updated, ${failed} skipped`
        : `${data.updated} withdrawal${data.updated === 1 ? "" : "s"} updated`,
      failed ? "info" : "success",
    );
    setChecked([]);
    router.refresh();
  }

  function exportExcel() {
    const rows = filtered.length > 0 ? filtered : withdrawals;
    if (rows.length === 0) {
      toast("Nothing to export", "info");
      return;
    }
    downloadXlsx(
      `withdrawals-${new Date().toISOString().slice(0, 10)}`,
      [
        [
          "Request ID",
          "Member ID",
          "Name",
          "Email",
          "Mobile",
          "Amount",
          "Status",
          "Wallet Balance",
          "Date Time",
          "Method",
          "Account Number",
          "Holder Name",
          "Bank",
          "Branch",
          "IFSC",
          "UPI ID",
          "Remarks",
          "Admin Note",
        ],
        ...rows.map((w) => [
          w.requestId,
          w.memberId,
          w.memberName,
          w.memberEmail,
          w.memberMobile,
          String(w.amount),
          w.status,
          String(w.memberPoints),
          formatDateTime(w.createdAt),
          w.method === "bank" ? "Bank Transfer" : "UPI Transfer",
          w.bank.accountNumber,
          w.bank.accountHolderName,
          w.bank.bankName,
          w.bank.branch,
          w.bank.ifsc,
          w.upiId,
          w.remarks,
          w.adminNote,
        ]),
      ],
      "Withdrawals",
    );
    toast("Excel file downloaded", "success");
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

      <div className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading || selectedRows.length === 0}
              onClick={() => bulkUpdate("approved")}
              className="inline-flex h-9 items-center rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white disabled:opacity-40"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={loading || selectedRows.length === 0}
              onClick={() => bulkUpdate("paid")}
              className="inline-flex h-9 items-center rounded-lg bg-sky-600 px-3 text-xs font-bold text-white disabled:opacity-40"
            >
              Mark Paid
            </button>
            <button
              type="button"
              disabled={loading || selectedRows.length === 0}
              onClick={() => bulkUpdate("rejected")}
              className="inline-flex h-9 items-center rounded-lg bg-rose-600 px-3 text-xs font-bold text-white disabled:opacity-40"
            >
              Reject
            </button>
            {selectedRows.length > 0 ? (
              <span className="text-xs font-semibold text-navy">
                {selectedRows.length} selected
              </span>
            ) : null}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="input-field h-9 w-56 pl-9"
                placeholder="Search"
              />
            </div>
            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-bold text-navy hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={allVisibleChecked}
                    onChange={toggleAll}
                    aria-label="Select all"
                    className="h-4 w-4 accent-navy"
                  />
                </th>
                <th className="pr-3">ID</th>
                <th className="pr-3">Name</th>
                <th className="pr-3">Amount</th>
                <th className="pr-3">Status</th>
                <th className="pr-3">Balance</th>
                <th className="pr-3">Date Time</th>
                <th className="pr-3">Account Number</th>
                <th className="pr-3">Holder Name</th>
                <th className="pr-3">Bank</th>
                <th className="pr-3">Branch</th>
                <th className="pr-3">IFSC</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {withdrawals.length === 0
                      ? "No withdrawals yet."
                      : "No withdrawals match this view."}
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr
                    key={w.id}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/40",
                      checked.includes(w.id) && "bg-gold-soft/30",
                    )}
                  >
                    <td className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={checked.includes(w.id)}
                        onChange={() => toggleOne(w.id)}
                        aria-label={`Select ${w.requestId}`}
                        className="h-4 w-4 accent-navy"
                      />
                    </td>
                    <td className="pr-3 font-mono text-xs">{w.requestId}</td>
                    <td className="pr-3">
                      <div className="font-medium text-navy">
                        {w.memberName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {w.memberId}
                      </div>
                    </td>
                    <td className="pr-3 whitespace-nowrap font-semibold">
                      {formatINR(w.amount)}
                    </td>
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
                    <td className="pr-3 whitespace-nowrap text-muted-foreground">
                      {formatINR(w.memberPoints)}
                    </td>
                    <td className="pr-3 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDateTime(w.createdAt)}
                    </td>
                    <td className="pr-3 font-mono text-xs">
                      {w.method === "upi"
                        ? w.upiId || "—"
                        : w.bank.accountNumber || "—"}
                    </td>
                    <td className="pr-3 text-xs">
                      {w.bank.accountHolderName || "—"}
                    </td>
                    <td className="pr-3 text-xs">{w.bank.bankName || "—"}</td>
                    <td className="pr-3 text-xs">{w.bank.branch || "—"}</td>
                    <td className="pr-3 font-mono text-xs">
                      {w.bank.ifsc || "—"}
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
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-white p-5 shadow-xl">
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
            <div className="flex flex-wrap items-center gap-2 pr-8">
              <h2 className="font-display text-2xl font-bold text-navy">
                {selected.requestId}
              </h2>
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                  statusStyle[selected.status],
                )}
              >
                {selected.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <DetailCard
                title="Request"
                rows={[
                  ["Request ID", selected.requestId],
                  ["Requested on", formatDateTime(selected.createdAt)],
                  ["Processed on", formatDateTime(selected.processedAt)],
                  ["Status", selected.status],
                ]}
              />

              <DetailCard
                title="Member"
                rows={[
                  ["Name", selected.memberName],
                  ["Member ID", selected.memberId],
                  ["Email", selected.memberEmail],
                  ["Mobile", selected.memberMobile || "—"],
                  ["Wallet balance", formatINR(selected.memberPoints)],
                ]}
              />

              <div className="rounded-xl bg-muted/70 p-3">
                <div className="font-semibold text-navy">Payout</div>
                <dl className="mt-2 space-y-1 text-xs">
                  <DetailRow
                    label="Amount"
                    value={formatINR(selected.amount)}
                  />
                  <DetailRow
                    label="Method"
                    value={
                      selected.method === "bank" ? "Bank Transfer" : "UPI Transfer"
                    }
                  />
                </dl>

                {selected.method === "bank" && selected.bank.accountNumber ? (
                  <dl className="mt-2 space-y-1 rounded-lg bg-white p-3 text-xs">
                    {(
                      [
                        ["Account Number", selected.bank.accountNumber],
                        ["Account Holder Name", selected.bank.accountHolderName],
                        ["Bank Name", selected.bank.bankName],
                        ["Branch", selected.bank.branch],
                        ["IFSC code", selected.bank.ifsc],
                      ] as [string, string][]
                    )
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <DetailRow key={label} label={label} value={value} />
                      ))}
                  </dl>
                ) : (
                  <dl className="mt-2 space-y-1 rounded-lg bg-white p-3 text-xs">
                    <DetailRow
                      label={selected.method === "upi" ? "UPI ID" : "Account"}
                      value={selected.upiId || selected.accountDetails || "—"}
                    />
                  </dl>
                )}
              </div>

              {selected.remarks ? (
                <div className="rounded-xl bg-muted/70 p-3">
                  <div className="font-semibold text-navy">Member remarks</div>
                  <p className="mt-1 text-xs break-words text-muted-foreground">
                    {selected.remarks}
                  </p>
                </div>
              ) : null}

              {selected.adminNote ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="font-semibold text-navy">Previous note</div>
                  <p className="mt-1 text-xs break-words text-amber-900">
                    {selected.adminNote}
                  </p>
                </div>
              ) : null}

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
