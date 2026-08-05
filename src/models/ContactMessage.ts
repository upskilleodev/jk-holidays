import { Schema, models, model, type InferSchemaType } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export type ContactMessageDocument = InferSchemaType<
  typeof ContactMessageSchema
>;

export const ContactMessage =
  models.ContactMessage || model("ContactMessage", ContactMessageSchema);
