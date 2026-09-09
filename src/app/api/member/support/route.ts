import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";
import { ContactMessage } from "@/models/ContactMessage";

const schema = z.object({
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = schema.parse(await request.json());
    await connectDB();

    const user = await User.findById(session.userId);
    if (!user || user.role !== "user") return jsonError("Unauthorized", 401);

    const count = await ContactMessage.countDocuments();
    const ticketId = `TCK${1000 + count + 1}`;

    const ticket = await ContactMessage.create({
      name: user.name,
      email: user.email,
      phone: user.mobile || "",
      subject: body.subject,
      message: body.message,
      source: "member_ticket",
      ticketId,
      priority: "medium",
      ticketStatus: "open",
    });

    return jsonOk({ ticket: { id: ticket._id, ticketId } }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
