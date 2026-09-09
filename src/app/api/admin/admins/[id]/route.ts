import { z } from "zod";
import { connectDB } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";

const updateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().email().max(120).optional(),
    adminRole: z.enum(["super_admin", "operations", "support"]).optional(),
    adminStatus: z.enum(["active", "invite_pending"]).optional(),
    password: z.string().min(6).max(72).optional(),
  })
  .refine(
    (v) =>
      v.name !== undefined ||
      v.email !== undefined ||
      v.adminRole !== undefined ||
      v.adminStatus !== undefined ||
      v.password !== undefined,
    { message: "Provide at least one field to update" },
  );

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

    if (body.email) {
      const email = body.email.toLowerCase();
      if (email !== admin.email) {
        const taken = await User.findOne({
          email,
          _id: { $ne: admin._id },
        }).select("_id");
        if (taken) return jsonError("Email is already in use", 409);
        admin.email = email;
      }
    }

    if (body.name) admin.name = body.name;
    if (body.adminRole) admin.adminRole = body.adminRole;
    if (body.adminStatus) admin.adminStatus = body.adminStatus;
    if (body.password) {
      admin.passwordHash = await hashPassword(body.password);
      admin.adminStatus = body.adminStatus || "active";
    }

    await admin.save();

    return jsonOk({
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        adminRole: admin.adminRole,
        adminStatus: admin.adminStatus,
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
