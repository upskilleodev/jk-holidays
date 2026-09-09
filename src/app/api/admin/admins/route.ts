import { z } from "zod";
import { connectDB } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { generateReferralCode } from "@/lib/utils";
import { User } from "@/models/User";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  adminRole: z
    .enum(["super_admin", "operations", "support"])
    .optional()
    .default("operations"),
});

function nameFromEmail(email: string) {
  const local = email.split("@")[0] || "Admin";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
    .slice(0, 60) || "Admin";
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const admins = await User.find({ role: "admin" })
      .select("-passwordHash")
      .sort({ createdAt: 1 });

    return jsonOk({ admins });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = createSchema.parse(await request.json());
    await connectDB();

    const email = body.email.toLowerCase().trim();
    const name = body.name?.trim() || nameFromEmail(email);
    const adminRole = body.adminRole || "operations";
    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.role === "admin") {
        return jsonError("This email is already an admin", 409);
      }

      existing.name = name;
      existing.role = "admin";
      existing.passwordHash = await hashPassword(body.password);
      existing.adminRole = adminRole;
      existing.adminStatus = "active";
      await existing.save();

      return jsonOk({
        admin: {
          _id: existing._id,
          name: existing.name,
          email: existing.email,
          role: existing.role,
          adminRole: existing.adminRole,
        },
      });
    }

    let referralCode = generateReferralCode(name);
    while (await User.findOne({ referralCode })) {
      referralCode = generateReferralCode(name);
    }

    const admin = await User.create({
      name,
      email,
      passwordHash: await hashPassword(body.password),
      role: "admin",
      adminRole,
      adminStatus: "active",
      referralCode,
      referredBy: null,
    });

    return jsonOk(
      {
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          adminRole: admin.adminRole,
        },
      },
      201,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
