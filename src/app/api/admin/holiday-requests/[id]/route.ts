import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { HolidayRequest } from "@/models/HolidayRequest";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
  adminNote: z.string().trim().max(500).optional(),
  altDates: z.string().trim().max(120).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await request.json());
    await connectDB();

    const doc = await HolidayRequest.findById(id);
    if (!doc) return jsonError("Request not found", 404);

    if (body.status) doc.status = body.status;
    if (body.adminNote !== undefined) doc.adminNote = body.adminNote;
    if (body.altDates !== undefined) doc.altDates = body.altDates;
    await doc.save();

    return jsonOk({ request: doc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
