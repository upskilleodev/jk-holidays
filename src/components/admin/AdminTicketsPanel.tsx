"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/feedback/toast";
import { cn } from "@/lib/utils";

export type AdminTicketRow = {
  id: string;
  ticketId: string;
  memberName: string;
  memberEmail: string;
  subject: string;
  message: string;
  priority: "high" | "medium" | "low";
  ticketStatus: "open" | "in_progress" | "resolved";
};

const priorityStyle = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-700",
} as const;

const statusLabel = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
} as const;

function TicketRowActions({ ticket }: { ticket: AdminTicketRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(body: {
    priority?: AdminTicketRow["priority"];
    ticketStatus?: AdminTicketRow["ticketStatus"];
  }) {
    setLoading(true);
    const res = await fetch(`/api/admin/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error || "Could not update ticket", "error");
      return;
    }
    toast("Ticket updated", "success");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <select
        disabled={loading}
        className="h-8 rounded-md border border-border bg-white px-2 text-xs"
        value={ticket.priority}
        onChange={(e) =>
          patch({ priority: e.target.value as AdminTicketRow["priority"] })
        }
        aria-label="Priority"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        disabled={loading}
        className="h-8 rounded-md border border-border bg-white px-2 text-xs"
        value={ticket.ticketStatus}
        onChange={(e) =>
          patch({
            ticketStatus: e.target.value as AdminTicketRow["ticketStatus"],
          })
        }
        aria-label="Status"
      >
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
  );
}

export function AdminTicketsPanel({ tickets }: { tickets: AdminTicketRow[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Support Tickets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dashboard › Support Tickets
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">Ticket ID</th>
                <th className="pr-3">Member</th>
                <th className="pr-3">Subject</th>
                <th className="pr-3">Priority</th>
                <th className="pr-3">Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No support tickets yet.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 align-top">
                    <td className="py-3 pr-3 font-mono text-xs">{t.ticketId}</td>
                    <td className="pr-3">
                      <div className="font-medium text-navy">{t.memberName}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.memberEmail}
                      </div>
                    </td>
                    <td className="pr-3">
                      <div className="max-w-[240px] font-medium text-navy">
                        {t.subject}
                      </div>
                      <div className="mt-0.5 max-w-[240px] truncate text-xs text-muted-foreground">
                        {t.message}
                      </div>
                    </td>
                    <td className="pr-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          priorityStyle[t.priority],
                        )}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="pr-3 text-navy">
                      {statusLabel[t.ticketStatus]}
                    </td>
                    <td>
                      <TicketRowActions ticket={t} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
