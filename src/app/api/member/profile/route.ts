import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";

function memberIdFrom(user: {
  _id: { toString(): string };
  referralCode: string;
}) {
  const tail = user._id.toString().slice(-6).toUpperCase();
  return user.referralCode?.startsWith("JK")
    ? user.referralCode
    : `JK${tail}`;
}

export async function GET() {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.userId).select("-passwordHash");
    if (!user || user.role !== "user") return jsonError("Unauthorized", 401);

    return jsonOk({
      profile: {
        name: user.name,
        email: user.email,
        mobile: user.mobile || "",
        memberId: memberIdFrom(user),
        dateOfBirth: user.dateOfBirth || "",
        address: user.address || "",
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  mobile: z.string().trim().max(20).optional().default(""),
  dateOfBirth: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().max(200).optional().default(""),
});

export async function PATCH(request: Request) {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = updateSchema.parse(await request.json());
    await connectDB();

    const user = await User.findById(session.userId);
    if (!user || user.role !== "user") return jsonError("Unauthorized", 401);

    const email = body.email.toLowerCase();
    if (email !== user.email) {
      const taken = await User.findOne({
        email,
        _id: { $ne: user._id },
      }).select("_id");
      if (taken) return jsonError("Email is already in use", 409);
      user.email = email;
    }

    user.name = body.name;
    user.mobile = body.mobile || "";
    user.dateOfBirth = body.dateOfBirth || "";
    user.address = body.address || "";
    await user.save();

    return jsonOk({
      profile: {
        name: user.name,
        email: user.email,
        mobile: user.mobile || "",
        memberId: memberIdFrom(user),
        dateOfBirth: user.dateOfBirth || "",
        address: user.address || "",
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
