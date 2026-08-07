import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
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

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  label: z.string().min(1).optional(),
  image: imageSchema.optional(),
  status: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();
    const resort = await Resort.findOne({
      $or: [{ _id: id }, { slug: id }],
    });
    if (!resort) return jsonError("Resort not found", 404);
    return jsonOk({ resort });
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

    const updates: Record<string, unknown> = { ...body };
    if (body.name) {
      let slug = slugifyTitle(body.name);
      const clash = await Resort.findOne({
        slug,
        _id: { $ne: id },
      });
      if (clash) slug = `${slug}-${Date.now().toString(36)}`;
      updates.slug = slug;
    }

    const resort = await Resort.findByIdAndUpdate(id, updates, { new: true });
    if (!resort) return jsonError("Resort not found", 404);
    return jsonOk({ resort });
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
    const resort = await Resort.findByIdAndDelete(id);
    if (!resort) return jsonError("Resort not found", 404);
    return jsonOk({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
