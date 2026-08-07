import { z } from "zod";
import { connectDB } from "@/lib/db";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { generateReferralCode } from "@/lib/utils";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    await connectDB();

    const email = body.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) return jsonError("Email already registered", 409);

    let referredBy = null;
    if (body.referralCode?.trim()) {
      const referrer = await User.findOne({
        referralCode: body.referralCode.trim().toUpperCase(),
      });
      if (!referrer) return jsonError("Invalid referral code", 400);
      referredBy = referrer._id;
    }

    let referralCode = generateReferralCode(body.name);
    while (await User.findOne({ referralCode })) {
      referralCode = generateReferralCode(body.name);
    }

    const user = await User.create({
      name: body.name.trim(),
      email,
      passwordHash: await hashPassword(body.password),
      role: "user",
      referralCode,
      referredBy,
    });

    const token = await createSessionToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    await setSessionCookie(token, "user");

    return jsonOk({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
