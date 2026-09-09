"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { MemberManagePanel } from "@/components/admin/MemberManagePanel";
import { toast } from "@/components/feedback/toast";
import { cn } from "@/lib/utils";

export type AdminMemberRow = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  referralCode: string;
  memberId: string;
  referralPoints: number;
  purchaseStatus: string | null;
  planTitle: string | null;
  planTier: "Silver" | "Gold" | "Platinum" | "Other";
  accountStatus: "active" | "inactive";
  joinedAt: string;
};

const planColor: Record<AdminMemberRow["planTier"], string> = {
  Silver: "bg-slate-200 text-slate-700",
  Gold: "bg-amber-100 text-amber-800",
  Platinum: "bg-violet-100 text-violet-700",
  Other: "bg-muted text-navy",
};

function planLabel(m: AdminMemberRow) {
  if (m.planTier !== "Other") return m.planTier;
  return m.planTitle || "—";
}

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminMembersTable({ members }: { members: AdminMemberRow[] }) {
  const router = useRouter();
  const importRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [applied, setApplied] = useState({
    q: "",
    plan: "all",
    status: "all",
    fromDate: "",
    toDate: "",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = applied.q.trim().toLowerCase();
    return members.filter((m) => {
      if (query) {
        const hay = `${m.name} ${m.email} ${m.mobile} ${m.memberId} ${m.referralCode}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (applied.plan !== "all" && m.planTier !== applied.plan) return false;
      if (applied.status !== "all" && m.accountStatus !== applied.status)
        return false;
      if (applied.fromDate) {
        if (new Date(m.joinedAt) < new Date(applied.fromDate)) return false;
      }
      if (applied.toDate) {
        const end = new Date(applied.toDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(m.joinedAt) > end) return false;
      }
      return true;
    });
  }, [members, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function applyFilters() {
    setApplied({ q, plan, status, fromDate, toDate });
    setPage(1);
  }

  function resetFilters() {
    setQ("");
    setPlan("all");
    setStatus("all");
    setFromDate("");
    setToDate("");
    setApplied({
      q: "",
      plan: "all",
      status: "all",
      fromDate: "",
      toDate: "",
    });
    setPage(1);
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? pageRows.map((m) => m.id) : []);
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
    );
  }

  function exportCsv() {
    const rows = [
      [
        "Member ID",
        "Name",
        "Mobile",
        "Email",
        "Plan",
        "Join Date",
        "Status",
        "Referral Code",
        "Points",
      ],
      ...filtered.map((m) => [
        m.memberId,
        m.name,
        m.mobile,
        m.email,
        planLabel(m),
        formatJoinDate(m.joinedAt),
        m.accountStatus,
        m.referralCode,
        String(m.referralPoints),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jk-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Members exported", "success");
  }

  async function setAccountStatus(
    id: string,
    accountStatus: "active" | "inactive",
  ) {
    setMenuId(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountStatus }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Could not update status", "error");
      return;
    }
    toast(
      accountStatus === "active" ? "Member activated" : "Member deactivated",
      "success",
    );
    router.refresh();
  }

  async function onAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setAdding(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        mobile: String(form.get("mobile") || ""),
        password: String(form.get("password") || ""),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (!res.ok) {
      toast(data.error || "Could not add member", "error");
      return;
    }
    toast("Member created — share the password securely", "success");
    setAddOpen(false);
    router.refresh();
  }

  function onImportFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result || "");
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        toast("CSV needs a header and at least one row", "error");
        return;
      }
      const header = lines[0].toLowerCase();
      if (!header.includes("email") || !header.includes("name")) {
        toast("CSV must include name and email columns", "error");
        return;
      }
      const cols = lines[0].split(",").map((c) => c.replace(/"/g, "").trim());
      const idx = {
        name: cols.findIndex((c) => c.toLowerCase() === "name"),
        email: cols.findIndex((c) => c.toLowerCase() === "email"),
        mobile: cols.findIndex((c) =>
          ["mobile", "phone", "mobile number"].includes(c.toLowerCase()),
        ),
      };
      let ok = 0;
      let fail = 0;
      for (const line of lines.slice(1)) {
        const parts = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((p) =>
          p.replace(/^"|"$/g, "").replace(/""/g, '"').trim(),
        );
        if (!parts) continue;
        const payload = {
          name: parts[idx.name] || "",
          email: parts[idx.email] || "",
          mobile: idx.mobile >= 0 ? parts[idx.mobile] || "" : "",
          password: `Jk${Math.random().toString(36).slice(2, 8)}!`,
        };
        if (!payload.name || !payload.email) {
          fail += 1;
          continue;
        }
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) ok += 1;
        else fail += 1;
      }
      toast(`Import done: ${ok} added, ${fail} skipped`, ok ? "success" : "error");
      router.refresh();
    };
    reader.readAsText(file);
  }

  const manageProps = (m: AdminMemberRow) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    referralCode: m.referralCode,
    memberId: m.memberId,
    referralPoints: m.referralPoints,
    purchaseStatus: m.purchaseStatus,
    joinedAt: m.joinedAt,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Members</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            Dashboard › Members
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={importRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              onImportFile(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-navy hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            Import Members
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-soft"
          >
            <Plus className="h-4 w-4" />
            Add New Member
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-navy">
              Search Member
            </label>
            <div className="relative mt-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="input-field pl-9"
                placeholder="Search by name, mobile, email or member ID..."
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-navy">
              Membership Plan
            </label>
            <select
              className="input-field mt-1"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="all">All Plans</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Other">Other / None</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-navy">Status</label>
            <select
              className="input-field mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-navy">Join Date</label>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <input
                type="date"
                className="input-field"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <input
                type="date"
                className="input-field"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold text-navy hover:bg-muted"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="h-9 px-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-semibold text-blue-600">Total Members:</span>{" "}
            {filtered.length}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold text-navy hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="mt-4 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-2">
                  <input
                    type="checkbox"
                    checked={
                      pageRows.length > 0 &&
                      pageRows.every((m) => selected.includes(m.id))
                    }
                    onChange={(e) => toggleAll(e.target.checked)}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="pr-2">Member ID</th>
                <th className="pr-2">Member Name</th>
                <th className="pr-2">Mobile Number</th>
                <th className="pr-2">Email</th>
                <th className="pr-2">Membership Plan</th>
                <th className="pr-2">Join Date</th>
                <th className="pr-2">Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No members match your filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-3 pr-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(m.id)}
                        onChange={(e) => toggleOne(m.id, e.target.checked)}
                        aria-label={`Select ${m.name}`}
                      />
                    </td>
                    <td className="pr-2 font-mono text-xs">{m.memberId}</td>
                    <td className="pr-2">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                          {m.name.trim().charAt(0).toUpperCase() || "M"}
                        </div>
                        <span className="font-medium text-navy">{m.name}</span>
                      </div>
                    </td>
                    <td className="pr-2">{m.mobile || "—"}</td>
                    <td className="pr-2 break-all">{m.email}</td>
                    <td className="pr-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          planColor[m.planTier],
                        )}
                      >
                        {planLabel(m)}
                      </span>
                    </td>
                    <td className="pr-2 text-muted-foreground">
                      {formatJoinDate(m.joinedAt)}
                    </td>
                    <td className="pr-2">
                      {m.accountStatus === "active" ? (
                        <span className="text-emerald-600">● Active</span>
                      ) : (
                        <span className="text-rose-600">● Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="relative flex items-center gap-0.5">
                        <MemberManagePanel
                          {...manageProps(m)}
                          trigger="eye"
                          initialTab="credentials"
                        />
                        <MemberManagePanel
                          {...manageProps(m)}
                          trigger="edit"
                          initialTab="password"
                        />
                        <button
                          type="button"
                          aria-label="More actions"
                          onClick={() =>
                            setMenuId((id) => (id === m.id ? null : m.id))
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuId === m.id ? (
                          <div className="absolute top-8 right-0 z-20 min-w-[160px] rounded-lg border bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-muted"
                              onClick={() =>
                                setAccountStatus(
                                  m.id,
                                  m.accountStatus === "active"
                                    ? "inactive"
                                    : "active",
                                )
                              }
                            >
                              Mark{" "}
                              {m.accountStatus === "active"
                                ? "Inactive"
                                : "Active"}
                            </button>
                            <div className="border-t px-1 py-1">
                              <MemberManagePanel
                                {...manageProps(m)}
                                trigger="manage"
                                initialTab="delete"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-3 lg:hidden">
          {pageRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No members match your filters.
            </p>
          ) : (
            pageRows.map((m) => (
              <article
                key={m.id}
                className="rounded-xl border border-border/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                      {m.name.trim().charAt(0).toUpperCase() || "M"}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-navy">
                        {m.name}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {m.memberId}
                      </div>
                    </div>
                  </div>
                  {m.accountStatus === "active" ? (
                    <span className="text-xs text-emerald-600">● Active</span>
                  ) : (
                    <span className="text-xs text-rose-600">● Inactive</span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Mobile</div>
                    <div>{m.mobile || "—"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Plan</div>
                    <div>{planLabel(m)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground">Email</div>
                    <div className="break-all">{m.email}</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-1">
                  <MemberManagePanel {...manageProps(m)} trigger="eye" />
                  <MemberManagePanel
                    {...manageProps(m)}
                    trigger="edit"
                    initialTab="password"
                  />
                  <MemberManagePanel {...manageProps(m)} />
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-muted-foreground">
            Showing{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of{" "}
            {filtered.length} entries
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid h-8 w-8 place-items-center rounded border text-xs disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 3),
                Math.max(0, currentPage - 3) + 5,
              )
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded border text-xs",
                    p === currentPage && "bg-navy text-white",
                  )}
                >
                  {p}
                </button>
              ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="grid h-8 w-8 place-items-center rounded border text-xs disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {addOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/50"
            aria-label="Close"
            onClick={() => !adding && setAddOpen(false)}
          />
          <form
            onSubmit={onAddMember}
            className="relative w-full max-w-md space-y-3 rounded-2xl border bg-white p-5 shadow-xl"
          >
            <h2 className="font-display text-xl font-bold text-navy">
              Add New Member
            </h2>
            <label className="block text-sm font-semibold text-navy">
              Full name
              <input name="name" required minLength={2} className="input-field mt-1" />
            </label>
            <label className="block text-sm font-semibold text-navy">
              Email
              <input
                name="email"
                type="email"
                required
                className="input-field mt-1"
              />
            </label>
            <label className="block text-sm font-semibold text-navy">
              Mobile
              <input name="mobile" className="input-field mt-1" />
            </label>
            <label className="block text-sm font-semibold text-navy">
              Temporary password
              <input
                name="password"
                type="text"
                required
                minLength={6}
                className="input-field mt-1"
                defaultValue="Welcome1"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={adding}
                onClick={() => setAddOpen(false)}
                className="h-10 rounded-lg px-4 text-sm font-semibold text-navy hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="h-10 rounded-lg bg-navy px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {adding ? "Creating…" : "Create member"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
