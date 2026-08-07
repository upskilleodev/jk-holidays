import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getAdminSession, requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { slugifyTitle } from "@/lib/utils";
import { Package } from "@/models/Package";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "1";
    const admin = await getAdminSession();

    const filter = all && admin ? {} : { status: "published" };

    const packages = await Package.find(filter).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return jsonOk({ packages });
  } catch (error) {
    return handleRouteError(error);
  }
}

const createSchema = z.object({
  title: z.string().min(2),
  summary: z.string().min(10),
  description: z.string().min(20),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional().nullable(),
  duration: z.string().min(2),
  validity: z.string().optional(),
  destination: z.string().min(2),
  inclusions: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  coverImage: z.string().url(),
  images: z.array(z.string()).default([]),
  badge: z.string().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  sortOrder: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = createSchema.parse(await request.json());
    await connectDB();

    let slug = slugifyTitle(body.title);
    const existing = await Package.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const pkg = await Package.create({ ...body, slug });
    return jsonOk({ package: pkg }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
