import { connectDB } from "@/lib/db";
import { destinations } from "@/lib/site";
import { Booking } from "@/models/Booking";
import { HolidayRequest } from "@/models/HolidayRequest";
import { Resort } from "@/models/Resort";
import {
  AdminBookingCalendar,
  type CalendarBooking,
} from "@/components/admin/AdminBookingCalendar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings" };

function toYmd(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default async function AdminBookingsPage() {
  await connectDB();

  const [bookings, approvedRequests, dbResorts] = await Promise.all([
    Booking.find().sort({ startDate: 1 }).lean(),
    HolidayRequest.find({ status: { $in: ["approved", "completed"] } })
      .populate("userId", "name email mobile")
      .lean(),
    Resort.find({ status: "published" }).select("name").lean(),
  ]);

  // Auto-import approved holiday requests that aren't linked yet
  const linked = new Set(
    bookings
      .map((b) => (b.holidayRequestId ? String(b.holidayRequestId) : ""))
      .filter(Boolean),
  );

  const missing = approvedRequests.filter((req) => !linked.has(String(req._id)));
  if (missing.length > 0) {
    await Booking.insertMany(
      missing.map((req) => {
        const user = req.userId as unknown as {
          name?: string;
          email?: string;
          mobile?: string;
        };
        return {
          clientName: user?.name || "Member",
          clientEmail: user?.email || "",
          clientMobile: user?.mobile || "",
          destination: req.destination,
          resort: req.resort || "",
          startDate: toYmd(req.checkIn),
          endDate: toYmd(req.checkOut),
          status: req.status === "completed" ? "checkout" : "confirmed",
          notes: req.specialRequests || "",
          holidayRequestId: req._id,
        };
      }),
    );
  }

  const allBookings =
    missing.length > 0
      ? await Booking.find().sort({ startDate: 1 }).lean()
      : bookings;

  const calendarBookings: CalendarBooking[] = allBookings.map((b) => ({
    id: String(b._id),
    clientName: b.clientName,
    clientEmail: b.clientEmail || "",
    clientMobile: b.clientMobile || "",
    destination: b.destination,
    resort: b.resort || "",
    startDate: b.startDate,
    endDate: b.endDate,
    status: (b.status || "pending") as CalendarBooking["status"],
    notes: b.notes || "",
  }));

  const resortNames = Array.from(
    new Set([
      ...dbResorts.map((r) => r.name),
      ...destinations.map((d) => d.name),
      ...calendarBookings.map((b) => b.destination).filter(Boolean),
      ...calendarBookings.map((b) => b.resort).filter(Boolean),
    ]),
  ).sort();

  return (
    <AdminBookingCalendar
      initialBookings={calendarBookings}
      resorts={resortNames}
    />
  );
}
