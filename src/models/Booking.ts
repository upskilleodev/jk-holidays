import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const BookingSchema = new Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, default: "", trim: true },
    clientMobile: { type: String, default: "", trim: true },
    destination: { type: String, required: true, trim: true },
    resort: { type: String, default: "", trim: true },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["confirmed", "pending", "checkout", "blocked"],
      default: "pending",
      index: true,
    },
    notes: { type: String, default: "" },
    holidayRequestId: {
      type: Schema.Types.ObjectId,
      ref: "HolidayRequest",
      default: null,
    },
  },
  { timestamps: true },
);

BookingSchema.index({ startDate: 1, endDate: 1 });

export type BookingDocument = InferSchemaType<typeof BookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Booking = models.Booking || model("Booking", BookingSchema);
