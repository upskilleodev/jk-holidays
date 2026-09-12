import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { User } from "@/models/User";
import { Withdrawal } from "@/models/Withdrawal";

export async function GET() {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);
    await connectDB();

    const withdrawals = await Withdrawal.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return jsonOk({ withdrawals });
  } catch (error) {
    return handleRouteError(error);
  }
}

const createSchema = z.object({
  amount: z.number().min(500, "Minimum withdrawal is ₹500"),
  method: z.enum(["bank", "upi"]),
  remarks: z.string().trim().max(240).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = createSchema.parse(await request.json());
    await connectDB();

    const user = await User.findById(session.userId);
    if (!user || user.role !== "user") return jsonError("Unauthorized", 401);

    const bank = user.bankAccount;
    const upiId = user.upiId || "";

    if (body.method === "bank" && !bank?.accountNumber) {
      return jsonError("Add your bank account details before withdrawing", 400);
    }
    if (body.method === "upi" && !upiId) {
      return jsonError("Add your UPI ID before withdrawing", 400);
    }

    const balance = user.referralPoints || 0;
    const pendingHeld = await Withdrawal.aggregate([
      {
        $match: {
          userId: user._id,
          status: "pending",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const held = pendingHeld[0]?.total || 0;
    const available = balance - held;

    if (body.amount > available) {
      return jsonError(
        `Insufficient balance. Available to withdraw: ₹${Math.max(0, available).toLocaleString("en-IN")}`,
        400,
      );
    }

    const accountDetails =
      body.method === "bank"
        ? [
            bank.accountHolderName,
            `A/c ${bank.accountNumber}`,
            bank.bankName,
            bank.branch,
            bank.ifsc,
          ]
            .filter(Boolean)
            .join(" · ")
        : upiId;

    const withdrawal = await Withdrawal.create({
      userId: user._id,
      amount: Math.round(body.amount),
      method: body.method,
      accountDetails,
      bank:
        body.method === "bank"
          ? {
              accountNumber: bank.accountNumber,
              accountHolderName: bank.accountHolderName,
              bankName: bank.bankName,
              branch: bank.branch || "",
              ifsc: bank.ifsc,
            }
          : undefined,
      upiId: body.method === "upi" ? upiId : "",
      remarks: body.remarks || "",
      status: "pending",
    });

    return jsonOk({ withdrawal }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
