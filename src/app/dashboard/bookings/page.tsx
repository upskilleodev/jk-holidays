import Image from "next/image";
import Link from "next/link";
import { Check, Clock3 } from "lucide-react";
import { destinations } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = { title: "My Bookings" };

const bookings = [
  {
    dest: "Maldives",
    nights: "3 Nights / 4 Days",
    dates: "10 Feb 2024 – 13 Feb 2024",
    status: "completed" as const,
    image: "/assets/dest-maldives.jpg",
  },
  {
    dest: "Manali, Himachal",
    nights: "4 Nights / 5 Days",
    dates: "22 Dec 2023 – 26 Dec 2023",
    status: "completed" as const,
    image: "/assets/dest-kashmir.jpg",
  },
  {
    dest: "Dubai",
    nights: "4 Nights / 5 Days",
    dates: "05 Oct 2023 – 09 Oct 2023",
    status: "completed" as const,
    image: "/assets/dest-dubai.jpg",
  },
  {
    dest: destinations[5]?.name || "Goa",
    nights: "4 Nights / 5 Days",
    dates: "Requested · awaiting confirmation",
    status: "pending" as const,
    image: destinations[5]?.image || "/assets/dest-goa.jpg",
  },
];

export default function BookingsPage() {
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
                <tr key={`${b.dest}-${b.dates}`} className="border-t">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={b.image}
                        alt={b.dest}
                        width={56}
                        height={40}
                        className="h-10 w-14 rounded object-cover"
                      />
                      <span className="font-semibold text-navy">{b.dest}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{b.nights}</td>
                  <td className="px-3 py-3 text-muted-foreground">{b.dates}</td>
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
              key={`${b.dest}-${b.dates}-m`}
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
                  <div className="text-xs text-muted-foreground">{b.dates}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "completed" | "pending" }) {
  const completed = status === "completed";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
        completed
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-800",
      )}
    >
      {completed ? (
        <>
          Completed <Check className="h-3 w-3" />
        </>
      ) : (
        <>
          Pending <Clock3 className="h-3 w-3" />
        </>
      )}
    </span>
  );
}
