import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const WithdrawalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 500 },
    method: { type: String, enum: ["bank", "upi"], required: true },
    accountDetails: { type: String, required: true, trim: true },
    remarks: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
      index: true,
    },
    adminNote: { type: String, default: "" },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type WithdrawalDocument = InferSchemaType<typeof WithdrawalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Withdrawal =
  models.Withdrawal || model("Withdrawal", WithdrawalSchema);
