import { Schema, models, model, type InferSchemaType } from "mongoose";

const CashbackSettingSchema = new Schema(
  {
    type: { type: String, enum: ["fixed", "percentage"], default: "fixed" },
    value: { type: Number, required: true, default: 1000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type CashbackSettingDocument = InferSchemaType<
  typeof CashbackSettingSchema
>;

export const CashbackSetting =
  models.CashbackSetting || model("CashbackSetting", CashbackSettingSchema);
