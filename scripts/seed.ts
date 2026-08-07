import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    adminRole: {
      type: String,
      enum: ["super_admin", "operations", "support"],
    },
    adminStatus: {
      type: String,
      enum: ["active", "invite_pending"],
    },
    referralCode: { type: String, unique: true },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const PackageSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    summary: String,
    description: String,
    price: Number,
    originalPrice: Number,
    duration: String,
    validity: String,
    destination: String,
    inclusions: [String],
    highlights: [String],
    coverImage: String,
    images: [String],
    badge: String,
    isFeatured: Boolean,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    sortOrder: Number,
  },
  { timestamps: true }
);

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    priceSnapshot: Number,
    referralCodeUsed: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "cancelled"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const CashbackSettingSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["fixed", "percentage"], default: "fixed" },
    value: Number,
    isActive: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Package =
  mongoose.models.Package || mongoose.model("Package", PackageSchema);
const Purchase =
  mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
const CashbackSetting =
  mongoose.models.CashbackSetting ||
  mongoose.model("CashbackSetting", CashbackSettingSchema);

const ResortSchema = new mongoose.Schema(
  {
    name: String,
    label: String,
    image: String,
    slug: { type: String, unique: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    sortOrder: Number,
  },
  { timestamps: true }
);

const Resort = mongoose.models.Resort || mongoose.model("Resort", ResortSchema);

const resorts = [
  {
    name: "Maldives",
    label: "Overwater Villas",
    image: "/assets/dest-maldives.jpg",
    slug: "maldives",
    status: "published",
    sortOrder: 1,
  },
  {
    name: "Bali",
    label: "Indonesia",
    image: "/assets/dest-bali.jpg",
    slug: "bali",
    status: "published",
    sortOrder: 2,
  },
  {
    name: "Dubai",
    label: "UAE",
    image: "/assets/dest-dubai.jpg",
    slug: "dubai",
    status: "published",
    sortOrder: 3,
  },
  {
    name: "Thailand",
    label: "Krabi",
    image: "/assets/dest-thailand.jpg",
    slug: "thailand",
    status: "published",
    sortOrder: 4,
  },
  {
    name: "Kashmir",
    label: "India",
    image: "/assets/dest-kashmir.jpg",
    slug: "kashmir",
    status: "published",
    sortOrder: 5,
  },
  {
    name: "Goa",
    label: "India",
    image: "/assets/dest-goa.jpg",
    slug: "goa",
    status: "published",
    sortOrder: 6,
  },
];

const packages = [
  {
    title: "Silver Escape",
    slug: "silver-escape",
    summary: "A refined short-break membership for premium resort stays.",
    description:
      "Silver Escape is designed for couples and small families who want curated luxury without the planning stress. Enjoy premium resort stays, member-only holiday offers, and dedicated support across select domestic destinations.",
    price: 15000,
    originalPrice: 30000,
    duration: "2 Nights / 3 Days",
    validity: "1 Year Validity",
    destination: "Domestic India",
    inclusions: [
      "Premium Resort Stay",
      "Member Exclusive Holiday Offers",
      "Customer Support",
      "Breakfast included",
    ],
    highlights: ["Ideal first membership", "Flexible booking window"],
    coverImage:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "",
    isFeatured: false,
    status: "published",
    sortOrder: 1,
  },
  {
    title: "Gold Horizon",
    slug: "gold-horizon",
    summary: "Our most popular plan for longer escapes and priority perks.",
    description:
      "Gold Horizon unlocks longer stays, priority member support, and seasonal discounts. Perfect for families who want multiple getaways with hotel stays, curated meals, and leisure activities included in the membership experience.",
    price: 25000,
    originalPrice: 50000,
    duration: "4 Nights / 5 Days",
    validity: "2 Years Validity",
    destination: "India & Select International",
    inclusions: [
      "Premium Resort Stay",
      "Priority Member Support",
      "Exclusive Member Discounts",
      "Seasonal Member Offers",
      "Food & leisure activities",
    ],
    highlights: ["Most popular", "Better long-term value"],
    coverImage:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "MOST POPULAR",
    isFeatured: true,
    status: "published",
    sortOrder: 2,
  },
  {
    title: "Platinum Voyage",
    slug: "platinum-voyage",
    summary: "Flagship membership with VIP privileges and international flair.",
    description:
      "Platinum Voyage is the flagship JK Holidays plan — extended nights, priority booking, VIP support, and elevated international opportunities. Built for members who want premium hotel stays, dining, trekking options, and signature tourism experiences.",
    price: 50000,
    originalPrice: 100000,
    duration: "10 Nights / 11 Days",
    validity: "5 Years Validity",
    destination: "India + International",
    inclusions: [
      "Premium Resort Stay",
      "Priority Booking",
      "Exclusive Member Benefits",
      "Complimentary Bali or Thailand trip opportunity",
      "VIP Customer Support",
      "Hotel, food, trekking & tourism activities",
    ],
    highlights: ["Best value", "VIP concierge feel"],
    coverImage:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1559599746-8823b38544c6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "BEST VALUE",
    isFeatured: true,
    status: "published",
    sortOrder: 3,
  },
];

const sampleUsers = [
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    referralCode: "RAHU7K2A",
    planSlug: "gold-horizon",
    status: "active" as const,
    referralCodeUsed: "",
  },
  {
    name: "Neha Kapoor",
    email: "neha.kapoor@example.com",
    referralCode: "NEHA9M3B",
    planSlug: "platinum-voyage",
    status: "active" as const,
    referralCodeUsed: "RAHU7K2A",
  },
  {
    name: "Amit Verma",
    email: "amit.verma@example.com",
    referralCode: "AMIT4P8C",
    planSlug: "silver-escape",
    status: "pending" as const,
    referralCodeUsed: "",
  },
  {
    name: "Priya Nair",
    email: "priya.nair@example.com",
    referralCode: "PRIY2Q6D",
    planSlug: "gold-horizon",
    status: "pending" as const,
    referralCodeUsed: "RAHU7K2A",
  },
  {
    name: "Suresh Iyer",
    email: "suresh.iyer@example.com",
    referralCode: "SURE5T1E",
    planSlug: "silver-escape",
    status: "rejected" as const,
    referralCodeUsed: "",
  },
  {
    name: "Ananya Das",
    email: "ananya.das@example.com",
    referralCode: "ANAN8W4F",
    planSlug: "platinum-voyage",
    status: "pending" as const,
    referralCodeUsed: "NEHA9M3B",
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);

  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@jkholidays.com"
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const memberPasswordHash = await bcrypt.hash("Member@123", 10);

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: "JK Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
      adminRole: "super_admin",
      adminStatus: "active",
      referralCode: "JKADMIN01",
      referredBy: null,
    },
    { upsert: true, returnDocument: "after" }
  );

  await User.deleteOne({ email: "ops@jkholidays.com" });

  const packageDocs: Record<string, { _id: mongoose.Types.ObjectId; price: number }> =
    {};

  for (const pkg of packages) {
    const doc = await Package.findOneAndUpdate({ slug: pkg.slug }, pkg, {
      upsert: true,
      returnDocument: "after",
    });
    packageDocs[pkg.slug] = { _id: doc!._id, price: doc!.price };
  }

  for (const resort of resorts) {
    await Resort.findOneAndUpdate({ slug: resort.slug }, resort, {
      upsert: true,
      returnDocument: "after",
    });
  }

  const existingSetting = await CashbackSetting.findOne();
  if (!existingSetting) {
    await CashbackSetting.create({
      type: "fixed",
      value: 1000,
      isActive: true,
    });
  }

  const createdUsers: Record<string, mongoose.Types.ObjectId> = {};

  for (const sample of sampleUsers) {
    const user = await User.findOneAndUpdate(
      { email: sample.email },
      {
        name: sample.name,
        email: sample.email,
        passwordHash: memberPasswordHash,
        role: "user",
        referralCode: sample.referralCode,
        referredBy: null,
      },
      { upsert: true, returnDocument: "after" }
    );
    createdUsers[sample.referralCode] = user!._id;
  }

  // Wire referral relationships after all users exist
  for (const sample of sampleUsers) {
    if (!sample.referralCodeUsed) continue;
    const referrerId = createdUsers[sample.referralCodeUsed];
    if (!referrerId) continue;
    await User.updateOne(
      { email: sample.email },
      { referredBy: referrerId }
    );
  }

  for (const sample of sampleUsers) {
    const userId = createdUsers[sample.referralCode];
    const plan = packageDocs[sample.planSlug];
    if (!userId || !plan) continue;

    await Purchase.findOneAndUpdate(
      { userId },
      {
        userId,
        packageId: plan._id,
        priceSnapshot: plan.price,
        referralCodeUsed: sample.referralCodeUsed,
        status: sample.status,
        adminNote:
          sample.status === "active"
            ? "Sample approved order — payment collected."
            : sample.status === "rejected"
              ? "Sample rejected order."
              : "",
        approvedAt: sample.status === "active" ? new Date() : null,
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log("Seed complete");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("Sample members password: Member@123");
  console.log(`Sample users + orders: ${sampleUsers.length}`);
  console.log(`Resorts seeded: ${resorts.length}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
