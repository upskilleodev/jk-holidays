import { z } from "zod";
import { connectDB } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";

const updateSchema = z.object({
  password: z.string().min(6).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = updateSchema.parse(await request.json());
    await connectDB();

    const admin = await User.findById(id);
    if (!admin || admin.role !== "admin") {
      return jsonError("Admin not found", 404);
    }

    if (!body.password) {
      return jsonError("Enter a new password", 400);
    }

    admin.passwordHash = await hashPassword(body.password);
    admin.adminStatus = "active";
    await admin.save();

    return jsonOk({
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    await connectDB();

    if (session.userId === id) {
      return jsonError("You cannot remove your own admin account", 400);
    }

    const admin = await User.findById(id);
    if (!admin || admin.role !== "admin") {
      return jsonError("Admin not found", 404);
    }

    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return jsonError("Keep at least one admin account", 400);
    }

    await User.findByIdAndDelete(id);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
