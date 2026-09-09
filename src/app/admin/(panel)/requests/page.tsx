import { connectDB } from "@/lib/db";
import { HolidayRequest } from "@/models/HolidayRequest";
import { Purchase } from "@/models/Purchase";
import {
  AdminHolidayRequestsPanel,
  type AdminHolidayRequestRow,
} from "@/components/admin/AdminHolidayRequestsPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Holiday Requests" };

function formatDates(checkIn: string, checkOut: string) {
  const fmt = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(checkIn)} - ${fmt(checkOut)}`;
}

function shortNights(label: string) {
  return label
    .replace(/ Nights?/gi, "N")
    .replace(/ Days?/gi, "D")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function AdminHolidayRequestsPage() {
  await connectDB();
  const docs = await HolidayRequest.find()
    .populate("userId", "name email mobile")
    .sort({ createdAt: -1 })
    .lean();

  const userIds = docs
    .map((d) => String((d.userId as { _id?: unknown })?._id || d.userId))
    .filter(Boolean);

  const purchases = await Purchase.find({ userId: { $in: userIds } })
    .populate("packageId", "title")
    .lean();
  const planByUser = new Map(
    purchases.map((p) => {
      const pkg = p.packageId as { title?: string } | null;
      return [String(p.userId), pkg?.title || ""] as const;
    }),
  );

  const requests: AdminHolidayRequestRow[] = docs.map((doc) => {
    const user = doc.userId as unknown as {
      _id?: { toString(): string };
      name?: string;
      email?: string;
      mobile?: string;
    };
    const userId = String(user?._id || doc.userId);
    const nights =
      shortNights(doc.nightsLabel || "") ||
      (() => {
        const a = new Date(doc.checkIn).getTime();
        const b = new Date(doc.checkOut).getTime();
        if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return "—";
        const n = Math.round((b - a) / 86400000);
        return `${n}N / ${n + 1}D`;
      })();

    return {
      id: String(doc._id),
      requestId: doc.requestId,
      memberName: user?.name || "Member",
      memberEmail: user?.email || "",
      memberMobile: user?.mobile || "",
      planLabel: planByUser.get(userId) || "",
      destination: doc.destination,
      resort: doc.resort || "",
      dates: formatDates(doc.checkIn, doc.checkOut),
      nights,
      status: (doc.status || "pending") as AdminHolidayRequestRow["status"],
      rooms: doc.rooms || "1 Room",
      travellers: (doc.travellers || []).map(
        (t: { name?: string; age?: string; gender?: string; mobile?: string }) => ({
          name: t.name || "",
          age: t.age || "",
          gender: t.gender || "",
          mobile: t.mobile || "",
        }),
      ),
      specialRequests: doc.specialRequests || "",
      adminNote: doc.adminNote || "",
      altDates: doc.altDates || "",
      createdAt: new Date(doc.createdAt).toISOString(),
    };
  });

  return <AdminHolidayRequestsPanel requests={requests} />;
}
