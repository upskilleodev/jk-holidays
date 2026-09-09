import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { Booking } from "@/models/Booking";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  clientName: z.string().trim().min(2).max(80).optional(),
  clientEmail: z.union([z.literal(""), z.string().email()]).optional(),
  clientMobile: z.string().trim().max(20).optional(),
  destination: z.string().trim().min(2).max(80).optional(),
  resort: z.string().trim().max(120).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: z.enum(["confirmed", "pending", "checkout", "blocked"]).optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = schema.parse(await request.json());
    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) return jsonError("Booking not found", 404);

    if (body.clientName !== undefined) booking.clientName = body.clientName;
    if (body.clientEmail !== undefined) booking.clientEmail = body.clientEmail;
    if (body.clientMobile !== undefined) booking.clientMobile = body.clientMobile;
    if (body.destination !== undefined) booking.destination = body.destination;
    if (body.resort !== undefined) booking.resort = body.resort;
    if (body.startDate !== undefined) booking.startDate = body.startDate;
    if (body.endDate !== undefined) booking.endDate = body.endDate;
    if (body.status !== undefined) booking.status = body.status;
    if (body.notes !== undefined) booking.notes = body.notes;

    if (booking.endDate < booking.startDate) {
      return jsonError("End date must be on or after start date");
    }

    await booking.save();
    return jsonOk({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) return jsonError("Booking not found", 404);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
