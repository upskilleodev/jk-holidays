import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const PackageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    duration: { type: String, required: true },
    validity: { type: String, default: "" },
    destination: { type: String, required: true },
    inclusions: [{ type: String }],
    highlights: [{ type: String }],
    coverImage: { type: String, required: true },
    images: [{ type: String }],
    badge: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type PackageDocument = InferSchemaType<typeof PackageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Package = models.Package || model("Package", PackageSchema);
