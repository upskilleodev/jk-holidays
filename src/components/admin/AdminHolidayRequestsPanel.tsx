"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  Eye,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { toast } from "@/components/feedback/toast";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export type AdminHolidayRequestRow = {
  id: string;
  requestId: string;
  memberName: string;
  memberEmail: string;
  memberMobile: string;
  planLabel: string;
  destination: string;
  resort: string;
  dates: string;
  nights: string;
  status: "pending" | "approved" | "rejected" | "completed";
  rooms: string;
  travellers: Array<{
    name: string;
    age: string;
    gender: string;
    mobile: string;
  }>;
  specialRequests: string;
  adminNote: string;
  altDates: string;
  createdAt: string;
};

const statusStyles: Record<AdminHolidayRequestRow["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  completed: "bg-sky-50 text-sky-700 border-sky-200",
};

function StatusBadge({ status }: { status: AdminHolidayRequestRow["status"] }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left shadow-sm transition",
        tone,
        active && "ring-2 ring-navy/30",
      )}
    >
      <div className="text-[10px] font-bold tracking-[0.14em] uppercase">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-bold">{value}</div>
    </button>
  );
}

export function AdminHolidayRequestsPanel({
  requests,
}: {
  requests: AdminHolidayRequestRow[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | AdminHolidayRequestRow["status"]
  >("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    }),
    [requests],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!query) return true;
      const hay =
        `${r.requestId} ${r.memberName} ${r.destination} ${r.resort}`.toLowerCase();
      return hay.includes(query);
    });
  }, [requests, q, statusFilter]);

  const detail =
    requests.find((r) => r.id === selectedId) ||
    filtered.find((r) => r.id === selectedId) ||
    null;

  async function updateRequest(
    id: string,
    body: {
      status?: AdminHolidayRequestRow["status"];
      adminNote?: string;
      altDates?: string;
    },
  ) {
    setLoading(true);
    const res = await fetch(`/api/admin/holiday-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error || "Could not update request", "error");
      return;
    }
    toast("Request updated", "success");
    router.refresh();
  }

  function suggestAltDates() {
    if (!detail) return;
    const value = window.prompt(
      "Suggest alternate travel dates",
      detail.altDates || detail.dates,
    );
    if (value === null) return;
    updateRequest(detail.id, { altDates: value });
  }

  function sendMessage() {
    if (!detail) return;
    const subject = encodeURIComponent(
      `JK Holidays — Request ${detail.requestId}`,
    );
    const body = encodeURIComponent(
      `Hi ${detail.memberName},\n\nRegarding your holiday request ${detail.requestId} for ${detail.destination} (${detail.dates}).\n\n— JK Holidays`,
    );
    window.location.href = `mailto:${detail.memberEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Holiday Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dashboard › Holiday Requests
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={counts.total}
          tone="border-blue-200 bg-blue-50 text-blue-700"
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          tone="border-amber-200 bg-amber-50 text-amber-700"
          active={statusFilter === "pending"}
          onClick={() => setStatusFilter("pending")}
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          tone="border-emerald-200 bg-emerald-50 text-emerald-700"
          active={statusFilter === "approved"}
          onClick={() => setStatusFilter("approved")}
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          tone="border-rose-200 bg-rose-50 text-rose-700"
          active={statusFilter === "rejected"}
          onClick={() => setStatusFilter("rejected")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input-field pl-9"
              placeholder="Search by Member / Request ID / Destination"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-2">Request ID</th>
                  <th className="pr-2">Member Name</th>
                  <th className="pr-2">Destination</th>
                  <th className="pr-2">Travel Dates</th>
                  <th className="pr-2">Nights</th>
                  <th className="pr-2">Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No holiday requests found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/40",
                        selectedId === r.id && "bg-gold-soft/30",
                      )}
                    >
                      <td className="py-3 pr-2 font-mono text-xs">
                        {r.requestId}
                      </td>
                      <td className="pr-2 font-medium text-navy">
                        {r.memberName}
                      </td>
                      <td className="pr-2">{r.destination}</td>
                      <td className="pr-2 text-muted-foreground">{r.dates}</td>
                      <td className="pr-2">{r.nights}</td>
                      <td className="pr-2">
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <button
                          type="button"
                          aria-label={`View ${r.requestId}`}
                          onClick={() => setSelectedId(r.id)}
                          className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm break-words lg:min-h-[420px]">
          {detail ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Request Details
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy">
                    {detail.requestId}
                  </h3>
                </div>
                <StatusBadge status={detail.status} />
              </div>

              <div className="rounded-xl bg-muted/70 p-3 text-sm">
                <div className="font-semibold text-navy">Member Information</div>
                <div className="mt-1 text-muted-foreground">
                  {detail.memberName}
                  {detail.planLabel ? ` · ${detail.planLabel}` : ""}
                </div>
                <div className="text-muted-foreground">
                  {detail.memberMobile || "—"} · {detail.memberEmail}
                </div>
              </div>

              <div className="rounded-xl bg-muted/70 p-3 text-sm">
                <div className="font-semibold text-navy">Request Information</div>
                <div className="mt-1 text-muted-foreground">
                  Destination: {detail.destination}
                </div>
                <div className="text-muted-foreground">
                  Resort: {detail.resort || "—"}
                </div>
                <div className="text-muted-foreground">
                  Dates: {detail.dates}
                </div>
                <div className="text-muted-foreground">
                  Nights: {detail.nights} · Rooms: {detail.rooms}
                </div>
                {detail.altDates ? (
                  <div className="mt-1 font-medium text-amber-700">
                    Alt dates: {detail.altDates}
                  </div>
                ) : null}
                {detail.specialRequests ? (
                  <div className="mt-2 text-muted-foreground">
                    Notes: {detail.specialRequests}
                  </div>
                ) : null}
              </div>

              {detail.travellers.length > 0 ? (
                <div className="rounded-xl bg-muted/70 p-3 text-sm">
                  <div className="font-semibold text-navy">Travellers</div>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {detail.travellers.map((t, i) => (
                      <li key={`${t.name}-${i}`}>
                        {t.name || `Guest ${i + 1}`}
                        {t.age ? ` · ${t.age}` : ""}
                        {t.gender ? ` · ${t.gender}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading || detail.status === "approved"}
                  onClick={() =>
                    updateRequest(detail.id, { status: "approved" })
                  }
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={loading || detail.status === "rejected"}
                  onClick={() => {
                    const note =
                      window.prompt("Rejection note (optional)") || "";
                    updateRequest(detail.id, {
                      status: "rejected",
                      adminNote: note,
                    });
                  }}
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={suggestAltDates}
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border text-sm font-semibold text-navy hover:bg-muted"
                >
                  <CalendarClock className="h-4 w-4" />
                  Alt Dates
                </button>
                <button
                  type="button"
                  onClick={sendMessage}
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border text-sm font-semibold text-navy hover:bg-muted"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Msg
                </button>
              </div>

              <a
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
                className="block text-center text-xs font-semibold text-blue-600 hover:underline"
              >
                Call support line {site.phone}
              </a>
            </div>
          ) : (
            <div className="grid h-full min-h-[280px] place-items-center text-center text-sm text-muted-foreground">
              Select a request to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
