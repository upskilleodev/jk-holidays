import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const TravellerSchema = new Schema(
  {
    name: { type: String, default: "" },
    age: { type: String, default: "" },
    gender: { type: String, default: "" },
    mobile: { type: String, default: "" },
    idType: { type: String, default: "" },
    idNumber: { type: String, default: "" },
  },
  { _id: false },
);

const HolidayRequestSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    destination: { type: String, required: true },
    resort: { type: String, default: "" },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    nightsLabel: { type: String, default: "" },
    rooms: { type: String, default: "1 Room" },
    arrival: { type: String, default: "" },
    departure: { type: String, default: "" },
    airportPickup: { type: String, default: "No" },
    sightseeing: { type: String, default: "No" },
    travellers: { type: [TravellerSchema], default: [] },
    mealPreference: { type: String, default: "" },
    celebration: { type: String, default: "No" },
    wheelchair: { type: String, default: "No" },
    specialRequests: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },
    adminNote: { type: String, default: "" },
    altDates: { type: String, default: "" },
  },
  { timestamps: true },
);

export type HolidayRequestDocument = InferSchemaType<
  typeof HolidayRequestSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const HolidayRequest =
  models.HolidayRequest || model("HolidayRequest", HolidayRequestSchema);
