import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { Package } from "@/models/Package";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  summary: z.string().min(10).optional(),
  description: z.string().min(20).optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional().nullable(),
  duration: z.string().min(2).optional(),
  validity: z.string().optional(),
  destination: z.string().min(2).optional(),
  inclusions: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  coverImage: z.string().url().optional(),
  images: z.array(z.string()).optional(),
  badge: z.string().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();
    const pkg = await Package.findOne({
      $or: [{ _id: id }, { slug: id }],
    });
    if (!pkg) return jsonError("Package not found", 404);
    return jsonOk({ package: pkg });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = updateSchema.parse(await request.json());
    await connectDB();

    const pkg = await Package.findByIdAndUpdate(id, body, { new: true });
    if (!pkg) return jsonError("Package not found", 404);
    return jsonOk({ package: pkg });
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
    const pkg = await Package.findByIdAndDelete(id);
    if (!pkg) return jsonError("Package not found", 404);
    return jsonOk({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
