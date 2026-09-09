import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getMemberSession, hashPassword } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";

const schema = z
  .object({
    password: z.union([z.literal(""), z.string().min(6).max(72)]).default(""),
    confirmPassword: z.string().default(""),
    language: z.enum(["English", "Hindi"]),
    currency: z.enum(["INR", "USD", "AED"]),
    notifyEmail: z.boolean(),
    notifySms: z.boolean(),
    notifyOffers: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.password && v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export async function GET() {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.userId).select(
      "language currency notifyEmail notifySms notifyOffers",
    );
    if (!user || user.role !== "user") return jsonError("Unauthorized", 401);

    return jsonOk({
      settings: {
        language: user.language || "English",
        currency: user.currency || "INR",
        notifyEmail: user.notifyEmail !== false,
        notifySms: user.notifySms !== false,
        notifyOffers: user.notifyOffers !== false,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = schema.parse(await request.json());
    await connectDB();

    const user = await User.findById(session.userId);
    if (!user || user.role !== "user") return jsonError("Unauthorized", 401);

    user.language = body.language;
    user.currency = body.currency;
    user.notifyEmail = body.notifyEmail;
    user.notifySms = body.notifySms;
    user.notifyOffers = body.notifyOffers;

    if (body.password) {
      user.passwordHash = await hashPassword(body.password);
    }

    await user.save();

    return jsonOk({
      settings: {
        language: user.language,
        currency: user.currency,
        notifyEmail: user.notifyEmail,
        notifySms: user.notifySms,
        notifyOffers: user.notifyOffers,
        passwordUpdated: Boolean(body.password),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
