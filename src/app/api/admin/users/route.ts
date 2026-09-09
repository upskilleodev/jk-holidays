import { z } from "zod";
import { connectDB } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { generateReferralCode } from "@/lib/utils";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  mobile: z.string().trim().max(20).optional().default(""),
  password: z.string().min(6).max(72),
});

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const users = await User.find({ role: "user" })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    const purchases = await Purchase.find().select("userId status packageId");
    const purchaseMap = new Map(
      purchases.map((p) => [String(p.userId), p]),
    );

    const enriched = users.map((user) => ({
      ...user.toObject(),
      purchase: purchaseMap.get(String(user._id)) || null,
    }));

    return jsonOk({ users: enriched });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = createSchema.parse(await request.json());
    await connectDB();

    const email = body.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) return jsonError("Email already registered", 409);

    let referralCode = generateReferralCode(body.name);
    while (await User.findOne({ referralCode })) {
      referralCode = generateReferralCode(body.name);
    }

    const user = await User.create({
      name: body.name,
      email,
      mobile: body.mobile || "",
      passwordHash: await hashPassword(body.password),
      role: "user",
      referralCode,
      accountStatus: "active",
    });

    return jsonOk(
      {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          mobile: user.mobile || "",
          referralCode: user.referralCode,
          password: body.password,
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
