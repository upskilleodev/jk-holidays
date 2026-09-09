import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { ContactMessage } from "@/models/ContactMessage";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  priority: z.enum(["high", "medium", "low"]).optional(),
  ticketStatus: z.enum(["open", "in_progress", "resolved"]).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await request.json());
    await connectDB();

    const ticket = await ContactMessage.findById(id);
    if (!ticket) return jsonError("Ticket not found", 404);

    if (body.priority) ticket.priority = body.priority;
    if (body.ticketStatus) ticket.ticketStatus = body.ticketStatus;
    await ticket.save();

    return jsonOk({ ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
