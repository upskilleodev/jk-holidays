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
      required: true,
    },
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
      unique: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export type CashbackRewardDocument = InferSchemaType<
  typeof CashbackRewardSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const CashbackReward =
  models.CashbackReward || model("CashbackReward", CashbackRewardSchema);
