"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "@/components/feedback/toast";
import { destinations } from "@/lib/site";
import { cn } from "@/lib/utils";

const STEPS = [
  "Travel Details",
  "Traveller Details",
  "Additional Info",
  "Review & Submit",
  "Request Status",
] as const;

type Traveller = {
  name: string;
  age: string;
  gender: string;
  mobile: string;
  idType: string;
  idNumber: string;
};

type RequestRow = {
  id: string;
  dest: string;
  dates: string;
  nights: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  requested: string;
};

function mapApiStatus(
  status: string,
): RequestRow["status"] {
  const s = status.toLowerCase();
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  if (s === "completed") return "Completed";
  return "Pending";
}

function nightsLabel(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return "4 Nights / 5 Days";
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) {
    return "4 Nights / 5 Days";
  }
  const nights = Math.round((b - a) / 86400000);
  return `${nights} Nights / ${nights + 1} Days`;
}

export function HolidayRequestForm() {
  const searchParams = useSearchParams();
  const preset = searchParams.get("destination") || "";
  const openStatus =
    searchParams.get("step") === "status" ||
    searchParams.get("tab") === "status";

  const destOptions = useMemo(() => destinations.map((d) => d.name), []);

  const [step, setStep] = useState(openStatus ? 4 : 0);
  const [statusTab, setStatusTab] = useState<
    "All" | "Pending" | "Approved" | "Rejected"
  >("All");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch("/api/member/holiday-requests");
      if (!res.ok || !alive) return;
      const data = await res.json().catch(() => ({}));
      const rows = (data.requests || []) as Array<{
        requestId: string;
        destination: string;
        checkIn: string;
        checkOut: string;
        nightsLabel?: string;
        status: string;
        createdAt: string;
      }>;
      if (!alive) return;
      setRequests(
        rows.map((r) => ({
          id: r.requestId,
          dest: r.destination,
          dates: `${formatDisplayDate(r.checkIn)} – ${formatDisplayDate(r.checkOut)}`,
          nights: (r.nightsLabel || nightsLabel(r.checkIn, r.checkOut))
            .replace(" Nights / ", "N / ")
            .replace(" Days", "D"),
          status: mapApiStatus(r.status),
          requested: new Date(r.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        })),
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [destination, setDestination] = useState(
    preset && destOptions.includes(preset) ? preset : destOptions[0] || "Goa",
  );
  const [resort, setResort] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState("1 Room");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [airportPickup, setAirportPickup] = useState<"Yes" | "No">("No");
  const [sightseeing, setSightseeing] = useState<"Yes" | "No">("No");

  const [travellers, setTravellers] = useState<Traveller[]>([
    {
      name: "",
      age: "",
      gender: "Male",
      mobile: "",
      idType: "Aadhar",
      idNumber: "",
    },
  ]);

  const [mealPreference, setMealPreference] = useState("Vegetarian");
  const [celebration, setCelebration] = useState<"Yes" | "No">("No");
  const [wheelchair, setWheelchair] = useState<"Yes" | "No">("No");
  const [specialRequests, setSpecialRequests] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const nights = nightsLabel(checkIn, checkOut);
  const filtered =
    statusTab === "All"
      ? requests
      : requests.filter((r) => r.status === statusTab);

  function updateTraveller(index: number, patch: Partial<Traveller>) {
    setTravellers((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function submitRequest() {
    if (!confirmed) {
      toast("Please confirm traveller details are accurate", "error");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/member/holiday-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        resort,
        checkIn,
        checkOut,
        nightsLabel: nights,
        rooms,
        arrival,
        departure,
        airportPickup,
        sightseeing,
        travellers,
        mealPreference,
        celebration,
        wheelchair,
        specialRequests,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      toast(data.error || "Could not submit request", "error");
      return;
    }

    const created = data.request as {
      requestId: string;
      destination: string;
      checkIn: string;
      checkOut: string;
      nightsLabel?: string;
      createdAt: string;
    };

    setRequests((prev) => [
      {
        id: created.requestId,
        dest: created.destination,
        dates: `${formatDisplayDate(created.checkIn)} – ${formatDisplayDate(created.checkOut)}`,
        nights: (created.nightsLabel || nights)
          .replace(" Nights / ", "N / ")
          .replace(" Days", "D"),
        status: "Pending",
        requested: new Date(created.createdAt || Date.now()).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          },
        ),
      },
      ...prev,
    ]);
    toast("Holiday request submitted", "success");
    setStep(4);
    setStatusTab("Pending");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Side step buttons 1–5 */}
      <aside className="rounded-2xl border bg-white p-4 shadow-sm">
        <ol className="space-y-2">
          {STEPS.map((label, i) => {
            const active = step === i;
            const done = step > i;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm transition",
                    active
                      ? "bg-navy text-white"
                      : "hover:bg-muted text-navy",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                      active
                        ? "bg-gold text-navy-deep"
                        : done
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-navy",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className="truncate font-medium">{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        {step === 0 ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-navy">
                Travel Details
              </h2>
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-navy">
                4N / 5D Remaining
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Preferred Destination *">
                <select
                  className="input-field"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  {destOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Preferred Resort *">
                <input
                  className="input-field"
                  value={resort}
                  onChange={(e) => setResort(e.target.value)}
                  required
                />
              </Field>
              <Field label="Check-in Date *">
                <input
                  className="input-field"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </Field>
              <Field label="Check-out Date *">
                <input
                  className="input-field"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </Field>
              <Field label="Total Nights">
                <input className="input-field" value={nights} readOnly />
              </Field>
              <Field label="Number of Rooms">
                <input
                  className="input-field"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                />
              </Field>
              <Field label="Arrival Time">
                <input
                  className="input-field"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                />
              </Field>
              <Field label="Departure Time">
                <input
                  className="input-field"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <YesNo
                label="Airport Pickup"
                value={airportPickup}
                onChange={setAirportPickup}
              />
              <YesNo
                label="Local Sightseeing"
                value={sightseeing}
                onChange={setSightseeing}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!checkIn || !checkOut) {
                    toast("Select your check-in and check-out dates", "error");
                    return;
                  }
                  if (new Date(checkOut) <= new Date(checkIn)) {
                    toast("Check-out must be after check-in", "error");
                    return;
                  }
                  setStep(1);
                }}
                className="btn-primary"
              >
                NEXT
              </button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-navy">
                Traveller Details (Up to 4 Persons)
              </h2>
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-navy">
                Up to 4 Guests
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {travellers.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/80 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-bold text-navy">
                      {i + 1} Member
                    </div>
                    {travellers.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setTravellers((rows) =>
                            rows.filter((_, j) => j !== i),
                          )
                        }
                        className="text-rose-500 hover:text-rose-600"
                        aria-label="Remove traveller"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      className="input-field"
                      placeholder="Full name"
                      value={t.name}
                      onChange={(e) =>
                        updateTraveller(i, { name: e.target.value })
                      }
                    />
                    <input
                      className="input-field"
                      placeholder="Age"
                      value={t.age}
                      onChange={(e) =>
                        updateTraveller(i, { age: e.target.value })
                      }
                    />
                    <select
                      className="input-field"
                      value={t.gender}
                      onChange={(e) =>
                        updateTraveller(i, { gender: e.target.value })
                      }
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <input
                      className="input-field"
                      placeholder="Mobile"
                      value={t.mobile}
                      onChange={(e) =>
                        updateTraveller(i, { mobile: e.target.value })
                      }
                    />
                    <select
                      className="input-field"
                      value={t.idType}
                      onChange={(e) =>
                        updateTraveller(i, { idType: e.target.value })
                      }
                    >
                      <option>Aadhar</option>
                      <option>Passport</option>
                      <option>PAN</option>
                    </select>
                    <input
                      className="input-field"
                      placeholder="ID number"
                      value={t.idNumber}
                      onChange={(e) =>
                        updateTraveller(i, { idNumber: e.target.value })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {travellers.length < 4 ? (
              <button
                type="button"
                onClick={() =>
                  setTravellers((rows) => [
                    ...rows,
                    {
                      name: "",
                      age: "",
                      gender: "Male",
                      mobile: "",
                      idType: "Aadhar",
                      idNumber: "",
                    },
                  ])
                }
                className="mt-3 inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs font-bold text-navy hover:bg-muted"
              >
                <Plus className="h-4 w-4" /> Add Traveller
              </button>
            ) : null}

            <div className="mt-3 rounded-md bg-emerald-50 p-3 text-xs text-emerald-700">
              {travellers.length} of 4 Guest Slots Used
            </div>

            <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <h2 className="font-display text-xl font-bold text-navy">
              Additional Requirements
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoTile label="Airport Pickup" value={airportPickup} />
              <InfoTile label="Sightseeing Package" value={sightseeing} />
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">
                  Meal Preference
                </div>
                <select
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-navy outline-none"
                  value={mealPreference}
                  onChange={(e) => setMealPreference(e.target.value)}
                >
                  <option>Vegetarian</option>
                  <option>Non-Vegetarian</option>
                  <option>Jain</option>
                </select>
              </div>
              <YesNo
                label="Celebration / Anniversary"
                value={celebration}
                onChange={setCelebration}
              />
              <YesNo
                label="Wheelchair Assistance"
                value={wheelchair}
                onChange={setWheelchair}
              />
            </div>
            <div className="mt-6">
              <label className="text-sm font-semibold text-navy">
                Special Requests (Optional)
              </label>
              <textarea
                className="input-field mt-1 min-h-24 py-3"
                placeholder="Room on higher floor, near to lift if possible."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>
            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h2 className="font-display text-xl font-bold text-navy">
              Review Your Request
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ReviewBlock
                title="Travel Details"
                rows={[
                  ["Destination", destination],
                  ["Resort", resort],
                  [
                    "Check-in Date",
                    `${formatDisplayDate(checkIn)} (${arrival})`,
                  ],
                  [
                    "Check-out Date",
                    `${formatDisplayDate(checkOut)} (${departure})`,
                  ],
                  ["Total Nights", nights],
                  ["Rooms", rooms],
                  ["Airport Pickup", airportPickup],
                  ["Sightseeing Package", sightseeing],
                  ["Meal Preference", mealPreference],
                ]}
              />
              <ReviewBlock
                title="Traveller Details"
                rows={travellers.map((t, i) => [
                  `${i + 1}. ${t.name || "Guest"}`,
                  `${t.age || "—"} Y, ${t.gender} | ${t.idType}: ${t.idNumber || "—"}`,
                ])}
              />
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold text-navy">
                Special Requests
              </div>
              <div className="text-sm text-muted-foreground">
                {specialRequests || "None"}
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              I confirm that all traveller details are accurate.
            </label>
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex h-11 items-center rounded-lg border px-5 text-sm font-bold text-navy hover:bg-muted"
              >
                BACK
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={submitRequest}
                className="btn-primary disabled:opacity-60"
              >
                {submitting
                  ? "SUBMITTING…"
                  : "SUBMIT HOLIDAY REQUEST"}{" "}
                {!submitting ? <Check className="h-4 w-4" /> : null}
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-navy">
                My Requests
              </h2>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="btn-primary"
              >
                REQUEST HOLIDAY
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-b">
              {(["All", "Pending", "Approved", "Rejected"] as const).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setStatusTab(t)}
                    className={cn(
                      "px-3 py-2 text-sm",
                      statusTab === t
                        ? "border-b-2 border-gold font-semibold text-navy"
                        : "text-muted-foreground",
                    )}
                  >
                    {t}
                  </button>
                ),
              )}
            </div>

            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Request ID</th>
                    <th className="pr-3">Destination</th>
                    <th className="pr-3">Travel Dates</th>
                    <th className="pr-3">Nights</th>
                    <th className="pr-3">Status</th>
                    <th className="pr-3">Requested On</th>
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
                        No {statusTab === "All" ? "" : statusTab.toLowerCase() + " "}
                        requests yet.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-3 pr-3 font-medium text-navy">
                          {r.id}
                        </td>
                        <td className="pr-3">{r.dest}</td>
                        <td className="pr-3">{r.dates}</td>
                        <td className="pr-3">{r.nights}</td>
                        <td className="pr-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="pr-3">{r.requested}</td>
                        <td>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700"
                            aria-label="View request"
                            onClick={() => toast(`Viewing ${r.id}`, "info")}
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

            {/* Mobile list */}
            <div className="mt-4 space-y-3 md:hidden">
              {filtered.map((r) => (
                <article
                  key={`${r.id}-m`}
                  className="rounded-xl border border-border/80 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-navy">{r.id}</div>
                      <div className="text-sm text-navy">{r.dest}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {r.dates} · {r.nights}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-navy">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "Yes" | "No";
  onChange: (v: "Yes" | "No") => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-navy">{label}</label>
      <div className="mt-1 flex gap-4">
        {(["Yes", "No"] as const).map((o) => (
          <label key={o} className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              checked={value === o}
              onChange={() => onChange(o)}
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold text-navy">{value}</div>
    </div>
  );
}

function ReviewBlock({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="font-semibold text-navy">{title}</div>
      <div className="mt-3 space-y-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-right font-medium text-navy">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-11 items-center rounded-lg border px-5 text-sm font-bold text-navy hover:bg-muted"
      >
        BACK
      </button>
      <button type="button" onClick={onNext} className="btn-primary">
        NEXT
      </button>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "Pending" | "Approved" | "Rejected" | "Completed";
}) {
  const map = {
    Pending: {
      wrap: "bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
    },
    Approved: {
      wrap: "bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
    },
    Rejected: {
      wrap: "bg-rose-50 text-rose-800",
      dot: "bg-rose-500",
    },
    Completed: {
      wrap: "bg-sky-50 text-sky-800",
      dot: "bg-sky-500",
    },
  } as const;
  const style = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        style.wrap,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status}
    </span>
  );
}

function formatDisplayDate(value: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
