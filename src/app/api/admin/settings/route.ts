import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { SiteSetting } from "@/models/SiteSetting";
import { defaultContact } from "@/lib/site-settings";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const setting = await SiteSetting.findOne({ key: "site" }).lean<{
      email?: string;
      phone?: string;
    }>();

    return jsonOk({
      contact: {
        email: setting?.email || defaultContact.email,
        phone: setting?.phone || defaultContact.phone,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

const updateSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid mobile number")
    .max(20)
    .regex(/^[+\d][\d\s-]*$/, "Mobile number can only contain digits"),
});

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = updateSchema.parse(await request.json());
    await connectDB();

    const setting = await SiteSetting.findOneAndUpdate(
      { key: "site" },
      { key: "site", email: body.email, phone: body.phone },
      { upsert: true, new: true },
    );

    return jsonOk({
      contact: { email: setting.email, phone: setting.phone },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
