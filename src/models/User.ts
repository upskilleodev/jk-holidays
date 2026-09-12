import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    adminRole: {
      type: String,
      enum: ["super_admin", "operations", "support"],
    },
    adminStatus: {
      type: String,
      enum: ["active", "invite_pending"],
    },
    referralCode: { type: String, required: true, unique: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    /** Admin-managed referral / wallet points balance (INR). */
    referralPoints: { type: Number, default: 0, min: 0 },
    mobile: { type: String, default: "", trim: true },
    dateOfBirth: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    language: { type: String, default: "English", trim: true },
    currency: { type: String, default: "INR", trim: true },
    notifyEmail: { type: Boolean, default: true },
    notifySms: { type: Boolean, default: true },
    notifyOffers: { type: Boolean, default: true },
    accountStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    /** Payout destination used for wallet withdrawals. */
    bankAccount: {
      accountNumber: { type: String, default: "", trim: true },
      accountHolderName: { type: String, default: "", trim: true },
      bankName: { type: String, default: "", trim: true },
      branch: { type: String, default: "", trim: true },
      ifsc: { type: String, default: "", trim: true, uppercase: true },
    },
    upiId: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User = models.User || model("User", UserSchema);
