import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { ContactMessage } from "@/models/ContactMessage";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    await connectDB();
    const message = await ContactMessage.create(body);
    return jsonOk({ message }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return jsonOk({ messages });
  } catch (error) {
    return handleRouteError(error);
  }
}
