import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";

type BankFields = {
  accountNumber?: string;
  accountHolderName?: string;
  bankName?: string;
  branch?: string;
  ifsc?: string;
};

function serialize(bank: BankFields | undefined, upiId: string) {
  return {
    accountNumber: bank?.accountNumber || "",
    accountHolderName: bank?.accountHolderName || "",
    bankName: bank?.bankName || "",
    branch: bank?.branch || "",
    ifsc: bank?.ifsc || "",
    upiId,
  };
}

export async function GET() {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.userId).select(
      "role bankAccount upiId",
    );
    if (!user || user.role !== "user") return jsonError("Unauthorized", 401);

    return jsonOk({ bank: serialize(user.bankAccount, user.upiId || "") });
  } catch (error) {
    return handleRouteError(error);
  }
}

const bankSchema = z.object({
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, "Enter a valid account number"),
  accountHolderName: z
    .string()
    .trim()
    .min(2, "Enter the account holder name")
    .max(80),
  bankName: z.string().trim().min(2, "Enter the bank name").max(80),
  branch: z.string().trim().max(80).optional().default(""),
  ifsc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
});

const upiSchema = z.object({
  upiId: z
    .string()
    .trim()
    .regex(/^[\w.\-]{2,64}@[a-zA-Z]{2,64}$/, "Enter a valid UPI ID"),
});

const updateSchema = z.union([
  bankSchema.extend({ type: z.literal("bank") }),
  upiSchema.extend({ type: z.literal("upi") }),
]);

export async function PATCH(request: Request) {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = updateSchema.parse(await request.json());
    await connectDB();

    const user = await User.findById(session.userId);
    if (!user || user.role !== "user") return jsonError("Unauthorized", 401);

    if (body.type === "bank") {
      user.bankAccount = {
        accountNumber: body.accountNumber,
        accountHolderName: body.accountHolderName,
        bankName: body.bankName,
        branch: body.branch || "",
        ifsc: body.ifsc,
      };
    } else {
      user.upiId = body.upiId;
    }
    await user.save();

    return jsonOk({ bank: serialize(user.bankAccount, user.upiId || "") });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
