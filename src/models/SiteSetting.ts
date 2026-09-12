import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

/** Singleton document holding editable brand contact details. */
const SiteSettingSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export type SiteSettingDocument = InferSchemaType<typeof SiteSettingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteSetting =
  models.SiteSetting || model("SiteSetting", SiteSettingSchema);
