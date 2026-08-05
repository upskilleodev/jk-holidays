import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const PurchaseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    priceSnapshot: { type: Number, required: true },
    referralCodeUsed: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "cancelled"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type PurchaseDocument = InferSchemaType<typeof PurchaseSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Purchase = models.Purchase || model("Purchase", PurchaseSchema);
