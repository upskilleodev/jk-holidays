import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Clock3, Plane, X } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { getMembershipStatus } from "@/lib/membership";
import { HolidayRequest } from "@/models/HolidayRequest";
import { destinations } from "@/lib/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Bookings" };

type BookingStatus = "pending" | "approved" | "rejected" | "completed";

type BookingRow = {
  id: string;
  dest: string;
  nights: string;
  dates: string;
  status: BookingStatus;
  image: string;
};

const FALLBACK_IMAGE = "/assets/hero-resort.jpg";

function imageFor(destination: string) {
  const match = destinations.find(
    (d) => d.name.toLowerCase() === destination.trim().toLowerCase(),
  );
  return match?.image || FALLBACK_IMAGE;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nightsFrom(checkIn: string, checkOut: string) {
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return "—";
  const nights = Math.round((end - start) / 86400000);
  return `${nights} Nights / ${nights + 1} Days`;
}

export default async function BookingsPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/bookings");

  await connectDB();
  const [requests, membership] = await Promise.all([
    HolidayRequest.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .lean<
        Array<{
          _id: { toString(): string };
          destination: string;
          checkIn: string;
          checkOut: string;
          nightsLabel?: string;
          status: BookingStatus;
        }>
      >(),
    getMembershipStatus(session.userId),
  ]);

  const bookings: BookingRow[] = requests.map((r) => ({
    id: r._id.toString(),
    dest: r.destination,
    nights: r.nightsLabel || nightsFrom(r.checkIn, r.checkOut),
    dates:
      r.status === "pending"
        ? "Requested · awaiting confirmation"
        : `${formatDate(r.checkIn)} – ${formatDate(r.checkOut)}`,
    status: r.status,
    image: imageFor(r.destination),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track upcoming and past holiday bookings.
          </p>
        </div>
        <Link href="/dashboard/request" className="btn-navy">
          Request Holiday
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
            <Plane className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-navy">
            No bookings yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {membership === "active"
              ? "Raise a holiday request and it will show up here as soon as you submit it."
              : "Activate your membership plan to start requesting holidays."}
          </p>
          <Link
            href={
              membership === "active"
                ? "/dashboard/request"
                : "/dashboard/membership"
            }
            className="btn-navy mt-6 inline-flex"
          >
            {membership === "active"
              ? "Request Holiday"
              : "Browse membership plans"}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[oklch(0.97_0.01_260)] text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Dates</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={b.image}
                          alt={b.dest}
                          width={56}
                          height={40}
                          className="h-10 w-14 rounded object-cover"
                        />
                        <span className="font-semibold text-navy">
                          {b.dest}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {b.nights}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {b.dates}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {bookings.map((b) => (
              <article
                key={`${b.id}-m`}
                className="rounded-xl border border-border/80 p-3"
              >
                <div className="flex items-start gap-3">
                  <Image
                    src={b.image}
                    alt={b.dest}
                    width={72}
                    height={56}
                    className="h-14 w-[4.5rem] rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-navy">{b.dest}</div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {b.nights}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.dates}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const badgeStyles: Record<BookingStatus, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  approved: "bg-sky-100 text-sky-700",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-rose-100 text-rose-700",
};

const badgeLabels: Record<BookingStatus, string> = {
  completed: "Completed",
  approved: "Confirmed",
  pending: "Pending",
  rejected: "Rejected",
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const Icon =
    status === "completed" || status === "approved"
      ? Check
      : status === "rejected"
        ? X
        : Clock3;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
        badgeStyles[status],
      )}
    >
      {badgeLabels[status]} <Icon className="h-3 w-3" />
    </span>
  );
}
