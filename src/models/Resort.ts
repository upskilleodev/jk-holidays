import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const ResortSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type ResortDocument = InferSchemaType<typeof ResortSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Resort = models.Resort || model("Resort", ResortSchema);
