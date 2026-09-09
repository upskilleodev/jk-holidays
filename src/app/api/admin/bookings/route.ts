import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { Booking } from "@/models/Booking";

const schema = z.object({
  clientName: z.string().trim().min(2).max(80),
  clientEmail: z.union([z.literal(""), z.string().email()]).optional(),
  clientMobile: z.string().trim().max(20).optional().default(""),
  destination: z.string().trim().min(2).max(80),
  resort: z.string().trim().max(120).optional().default(""),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["confirmed", "pending", "checkout", "blocked"]),
  notes: z.string().trim().max(500).optional().default(""),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM
    const resort = searchParams.get("resort") || "";

    const filter: Record<string, unknown> = {};
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const start = `${month}-01`;
      const [y, m] = month.split("-").map(Number);
      const last = new Date(y, m, 0).getDate();
      const end = `${month}-${String(last).padStart(2, "0")}`;
      filter.startDate = { $lte: end };
      filter.endDate = { $gte: start };
    }
    if (resort && resort !== "all") {
      filter.$or = [
        { resort },
        { destination: resort },
      ];
    }

    const bookings = await Booking.find(filter).sort({ startDate: 1 }).lean();
    return jsonOk({ bookings });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = schema.parse(await request.json());
    if (body.endDate < body.startDate) {
      return jsonError("End date must be on or after start date");
    }
    await connectDB();
    const booking = await Booking.create(body);
    return jsonOk({ booking }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
