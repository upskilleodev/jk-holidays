"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "@/components/feedback/toast";
import { cn } from "@/lib/utils";

export type CalendarBooking = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientMobile: string;
  destination: string;
  resort: string;
  startDate: string;
  endDate: string;
  status: "confirmed" | "pending" | "checkout" | "blocked";
  notes: string;
};

const STATUS_META: Record<
  CalendarBooking["status"],
  { label: string; bar: string; dot: string }
> = {
  confirmed: {
    label: "Confirmed",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  pending: { label: "Pending", bar: "bg-amber-500", dot: "bg-amber-500" },
  checkout: { label: "Check-out", bar: "bg-blue-500", dot: "bg-blue-500" },
  blocked: { label: "Blocked", bar: "bg-rose-500", dot: "bg-rose-500" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function toYmd(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function inRange(day: string, start: string, end: string) {
  return day >= start && day <= end;
}

type FormState = {
  id?: string;
  clientName: string;
  clientEmail: string;
  clientMobile: string;
  destination: string;
  resort: string;
  startDate: string;
  endDate: string;
  status: CalendarBooking["status"];
  notes: string;
};

const emptyForm = (date = ""): FormState => ({
  clientName: "",
  clientEmail: "",
  clientMobile: "",
  destination: "",
  resort: "",
  startDate: date,
  endDate: date,
  status: "pending",
  notes: "",
});

export function AdminBookingCalendar({
  initialBookings,
  resorts,
}: {
  initialBookings: CalendarBooking[];
  resorts: string[];
}) {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [resortFilter, setResortFilter] = useState("all");
  const [view, setView] = useState<"month" | "list">("month");
  const [bookings, setBookings] = useState(initialBookings);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (resortFilter === "all") return bookings;
    return bookings.filter(
      (b) => b.resort === resortFilter || b.destination === resortFilter,
    );
  }, [bookings, resortFilter]);

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDow + daysInMonth }, (_, i) => {
    const day = i - firstDow + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function openCreate(day?: number) {
    const date = day ? toYmd(year, month, day) : toYmd(year, month, 1);
    setForm(emptyForm(date));
  }

  function openEdit(b: CalendarBooking) {
    setForm({
      id: b.id,
      clientName: b.clientName,
      clientEmail: b.clientEmail,
      clientMobile: b.clientMobile,
      destination: b.destination,
      resort: b.resort,
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
      notes: b.notes,
    });
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    const payload = {
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientMobile: form.clientMobile,
      destination: form.destination,
      resort: form.resort,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      notes: form.notes,
    };
    const res = await fetch(
      form.id ? `/api/admin/bookings/${form.id}` : "/api/admin/bookings",
      {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      toast(data.error || "Could not save booking", "error");
      return;
    }
    const saved = data.booking as {
      _id: string;
      clientName: string;
      clientEmail?: string;
      clientMobile?: string;
      destination: string;
      resort?: string;
      startDate: string;
      endDate: string;
      status: CalendarBooking["status"];
      notes?: string;
    };
    const row: CalendarBooking = {
      id: String(saved._id),
      clientName: saved.clientName,
      clientEmail: saved.clientEmail || "",
      clientMobile: saved.clientMobile || "",
      destination: saved.destination,
      resort: saved.resort || "",
      startDate: saved.startDate,
      endDate: saved.endDate,
      status: saved.status,
      notes: saved.notes || "",
    };
    setBookings((prev) => {
      const without = prev.filter((b) => b.id !== row.id);
      return [...without, row].sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      );
    });
    setForm(null);
    toast(form.id ? "Booking updated" : "Booking scheduled", "success");
    router.refresh();
  }

  async function onDelete() {
    if (!form?.id) return;
    if (!window.confirm("Delete this booking?")) return;
    setSaving(true);
    const res = await fetch(`/api/admin/bookings/${form.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (!res.ok) {
      toast("Could not delete booking", "error");
      return;
    }
    setBookings((prev) => prev.filter((b) => b.id !== form.id));
    setForm(null);
    toast("Booking deleted", "success");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            Calendar View
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule bookings, add client details, and manage status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreate()}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-soft"
        >
          <Plus className="h-4 w-4" />
          New booking
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="grid h-9 w-9 place-items-center rounded-lg border text-navy hover:bg-muted"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-[160px] text-center font-display text-lg font-bold text-navy">
              {monthLabel(year, month)}
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="grid h-9 w-9 place-items-center rounded-lg border text-navy hover:bg-muted"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="input-field w-40"
              value={resortFilter}
              onChange={(e) => setResortFilter(e.target.value)}
            >
              <option value="all">All Resorts</option>
              {resorts.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              className="input-field w-32"
              value={view}
              onChange={(e) => setView(e.target.value as "month" | "list")}
            >
              <option value="month">Month</option>
              <option value="list">List</option>
            </select>
          </div>
        </div>

        {view === "month" ? (
          <div className="mt-5 grid grid-cols-7 gap-1 text-xs">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="p-2 text-center font-semibold text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              const ymd = day ? toYmd(year, month, day) : "";
              const dayBookings = day
                ? filtered.filter((b) => inRange(ymd, b.startDate, b.endDate))
                : [];
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!day}
                  onClick={() => day && openCreate(day)}
                  className={cn(
                    "min-h-24 rounded-lg border p-1.5 text-left transition",
                    day
                      ? "bg-white hover:border-gold/50 hover:bg-gold-soft/20"
                      : "bg-muted/30",
                  )}
                >
                  {day ? (
                    <>
                      <div className="font-semibold text-navy">{day}</div>
                      <div className="mt-1 space-y-0.5">
                        {dayBookings.slice(0, 3).map((b) => (
                          <div
                            key={b.id}
                            role="presentation"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(b);
                            }}
                            className={cn(
                              "truncate rounded px-1 py-0.5 text-[10px] font-medium text-white",
                              STATUS_META[b.status].bar,
                            )}
                          >
                            {b.clientName} – {b.destination}
                          </div>
                        ))}
                        {dayBookings.length > 3 ? (
                          <div className="text-[10px] text-muted-foreground">
                            +{dayBookings.length - 3} more
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Client</th>
                  <th>Destination</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No bookings in this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-3 font-medium text-navy">
                        {b.clientName}
                      </td>
                      <td>{b.destination}</td>
                      <td className="text-muted-foreground">
                        {b.startDate} → {b.endDate}
                      </td>
                      <td>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold text-white",
                            STATUS_META[b.status].bar,
                          )}
                        >
                          {STATUS_META[b.status].label}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(b)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          {(
            Object.entries(STATUS_META) as [
              CalendarBooking["status"],
              (typeof STATUS_META)[CalendarBooking["status"]],
            ][]
          ).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("h-3 w-3 rounded-full", meta.dot)} />
              {meta.label}
            </div>
          ))}
        </div>
      </div>

      {form ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/50"
            aria-label="Close"
            onClick={() => !saving && setForm(null)}
          />
          <form
            onSubmit={onSave}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-white p-5 shadow-xl"
          >
            <button
              type="button"
              disabled={saving}
              onClick={() => setForm(null)}
              className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="font-display text-xl font-bold text-navy">
              {form.id ? "Edit booking" : "Schedule booking"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter client details and set status.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-navy sm:col-span-2">
                Client name *
                <input
                  required
                  minLength={2}
                  className="input-field mt-1"
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Email
                <input
                  type="email"
                  className="input-field mt-1"
                  value={form.clientEmail}
                  onChange={(e) =>
                    setForm({ ...form, clientEmail: e.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Mobile
                <input
                  className="input-field mt-1"
                  value={form.clientMobile}
                  onChange={(e) =>
                    setForm({ ...form, clientMobile: e.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Destination *
                <input
                  required
                  className="input-field mt-1"
                  value={form.destination}
                  onChange={(e) =>
                    setForm({ ...form, destination: e.target.value })
                  }
                  list="booking-destinations"
                />
                <datalist id="booking-destinations">
                  {resorts.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </label>
              <label className="block text-sm font-semibold text-navy">
                Resort
                <input
                  className="input-field mt-1"
                  value={form.resort}
                  onChange={(e) => setForm({ ...form, resort: e.target.value })}
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Start date *
                <input
                  required
                  type="date"
                  className="input-field mt-1"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                End date *
                <input
                  required
                  type="date"
                  className="input-field mt-1"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-semibold text-navy sm:col-span-2">
                Status
                <select
                  className="input-field mt-1"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as CalendarBooking["status"],
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checkout">Check-out</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-navy sm:col-span-2">
                Notes
                <textarea
                  className="input-field mt-1 min-h-20 resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap justify-between gap-2">
              {form.id ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={onDelete}
                  className="h-10 rounded-lg px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setForm(null)}
                  className="h-10 rounded-lg border px-4 text-sm font-semibold text-navy hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-navy px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save booking"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
