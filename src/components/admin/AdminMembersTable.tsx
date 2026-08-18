"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemberManagePanel } from "@/components/admin/MemberManagePanel";
import { formatINR } from "@/lib/utils";

export type AdminMemberRow = {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  memberId: string;
  referralPoints: number;
  purchaseStatus: string | null;
  planTitle: string | null;
  joinedAt: string;
};

export function AdminMembersTable({ members }: { members: AdminMemberRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.memberId.toLowerCase().includes(query) ||
        m.referralCode.toLowerCase().includes(query),
    );
  }, [members, q]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Members"
        description="View credentials, set referral points, and manage member accounts."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">Total members</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="font-display text-3xl font-bold text-navy">
              {members.length}
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">With purchase</div>
          <div className="mt-2 font-display text-3xl font-bold text-navy">
            {members.filter((m) => m.purchaseStatus).length}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">Points issued</div>
          <div className="mt-2 font-display text-3xl font-bold text-navy">
            {formatINR(
              members.reduce((sum, m) => sum + (m.referralPoints || 0), 0),
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <label className="text-xs font-semibold text-navy">Search member</label>
        <div className="relative mt-1.5 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input-field pl-9"
            placeholder="Search by name, email, member ID or referral code…"
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm">
          <span className="font-semibold text-blue-600">Showing:</span>{" "}
          {filtered.length} of {members.length}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">Member</th>
                <th className="pr-3">Login email</th>
                <th className="pr-3">Referral</th>
                <th className="pr-3">Points</th>
                <th className="pr-3">Plan</th>
                <th className="pr-3">Status</th>
                <th className="pr-3">Joined</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                          {m.name.trim().charAt(0).toUpperCase() || "M"}
                        </div>
                        <div>
                          <div className="font-semibold text-navy">{m.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {m.memberId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="pr-3 break-all">{m.email}</td>
                    <td className="pr-3 font-mono text-xs">{m.referralCode}</td>
                    <td className="pr-3 font-medium">
                      {formatINR(m.referralPoints || 0)}
                    </td>
                    <td className="pr-3">{m.planTitle || "—"}</td>
                    <td className="pr-3">
                      {m.purchaseStatus ? (
                        <span className={`status-pill status-${m.purchaseStatus}`}>
                          {m.purchaseStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No purchase
                        </span>
                      )}
                    </td>
                    <td className="pr-3 text-muted-foreground">
                      {new Date(m.joinedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 text-right">
                      <MemberManagePanel
                        id={m.id}
                        name={m.name}
                        email={m.email}
                        referralCode={m.referralCode}
                        memberId={m.memberId}
                        referralPoints={m.referralPoints}
                        purchaseStatus={m.purchaseStatus}
                        joinedAt={m.joinedAt}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 lg:hidden">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No members match your search.
            </p>
          ) : (
            filtered.map((m) => (
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
                      <div className="truncate text-xs text-muted-foreground">
                        {m.email}
                      </div>
                    </div>
                  </div>
                  {m.purchaseStatus ? (
                    <span className={`status-pill status-${m.purchaseStatus}`}>
                      {m.purchaseStatus}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Member ID</div>
                    <div className="font-mono">{m.memberId}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Points</div>
                    <div className="font-semibold">
                      {formatINR(m.referralPoints || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Referral</div>
                    <div className="font-mono">{m.referralCode}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Plan</div>
                    <div>{m.planTitle || "—"}</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <MemberManagePanel
                    id={m.id}
                    name={m.name}
                    email={m.email}
                    referralCode={m.referralCode}
                    memberId={m.memberId}
                    referralPoints={m.referralPoints}
                    purchaseStatus={m.purchaseStatus}
                    joinedAt={m.joinedAt}
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
