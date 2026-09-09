import { Schema, models, model, type InferSchemaType } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    source: {
      type: String,
      enum: ["contact", "member_ticket"],
      default: "contact",
    },
    ticketId: { type: String, default: "", index: true },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    ticketStatus: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true },
);

export type ContactMessageDocument = InferSchemaType<
  typeof ContactMessageSchema
>;

export const ContactMessage =
  models.ContactMessage || model("ContactMessage", ContactMessageSchema);
