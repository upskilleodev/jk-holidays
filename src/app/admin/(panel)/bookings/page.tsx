import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Bookings" };

const daysInMonth = 30;
const startDay = 0;
const bookings: Record<number, { label: string; tone: string }[]> = {
  10: [{ label: "Rahul Sharma – Goa", tone: "bg-emerald-500" }],
  11: [{ label: "Amit Kumar – Ooty", tone: "bg-amber-500" }],
  15: [{ label: "Neha Verma – Manali", tone: "bg-emerald-500" }],
  22: [{ label: "Pooja Singh – Dubai", tone: "bg-rose-500" }],
};

export default function AdminBookingsPage() {
  const cells = Array.from({ length: startDay + daysInMonth });

  return (
    <div>
      <AdminPageHeader
        title="Bookings"
        description="Calendar view of holiday stays. Demo data for ops planning."
      />
      <div className="mobile-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-display text-lg font-bold text-navy">
            June 2026
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-md border px-3 py-1.5">All Resorts</span>
            <span className="rounded-md border px-3 py-1.5">Month</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1 text-xs">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="p-2 text-center font-semibold text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {cells.map((_, i) => {
            const day = i - startDay + 1;
            const inMonth = day > 0 && day <= daysInMonth;
            return (
              <div
                key={i}
                className={`min-h-16 rounded border p-1 sm:min-h-20 ${
                  inMonth ? "bg-white" : "bg-muted/30"
                }`}
              >
                <div className="font-semibold text-navy">
                  {inMonth ? day : ""}
                </div>
                {inMonth
                  ? bookings[day]?.map((b, j) => (
                      <div
                        key={j}
                        className={`mt-1 truncate rounded px-1 py-0.5 text-[10px] text-white ${b.tone}`}
                      >
                        {b.label}
                      </div>
                    ))
                  : null}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {[
            ["bg-emerald-500", "Confirmed"],
            ["bg-amber-500", "Pending"],
            ["bg-blue-500", "Check-out"],
            ["bg-rose-500", "Blocked"],
          ].map(([tone, label]) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`h-3 w-3 rounded ${tone}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
