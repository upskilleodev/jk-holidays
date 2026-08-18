import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const CashbackRewardSchema = new Schema(
  {
    referrerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "cancelled"],
      default: "pending",
    },
    source: {
      type: String,
      enum: ["referral", "manual"],
      default: "referral",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

CashbackRewardSchema.index(
  { purchaseId: 1 },
  {
    unique: true,
    partialFilterExpression: { purchaseId: { $type: "objectId" } },
  },
);

export type CashbackRewardDocument = InferSchemaType<
  typeof CashbackRewardSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const CashbackReward =
  models.CashbackReward || model("CashbackReward", CashbackRewardSchema);
