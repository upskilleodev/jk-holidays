import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getAdminSession, requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { slugifyTitle } from "@/lib/utils";
import { Resort } from "@/models/Resort";

const imageSchema = z
  .string()
  .min(1)
  .refine(
    (v) => /^https?:\/\//i.test(v.trim()) || v.trim().startsWith("/"),
    "Enter a valid image link (https://…)",
  );

const createSchema = z.object({
  name: z.string().min(2),
  label: z.string().min(1),
  image: imageSchema,
  status: z.enum(["draft", "published"]).default("draft"),
  sortOrder: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "1";
    const admin = await getAdminSession();

    const filter = all && admin ? {} : { status: "published" };
    const resorts = await Resort.find(filter).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return jsonOk({ resorts });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = createSchema.parse(await request.json());
    await connectDB();

    let slug = slugifyTitle(body.name);
    const existing = await Resort.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const resort = await Resort.create({ ...body, slug });
    return jsonOk({ resort }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
