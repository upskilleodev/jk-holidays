/**
 * Aligns live MongoDB indexes with the current schemas.
 *
 * The cashback ledger once had a plain unique index on `purchaseId`, which
 * rejects every manual wallet adjustment after the first (they all store
 * `purchaseId: null`). Mongoose never rewrites index options on an existing
 * index, so the old one has to be dropped explicitly.
 */
import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

await mongoose.connect(uri);
const rewards = mongoose.connection.db.collection("cashbackrewards");

const indexes = await rewards.indexes();
const legacy = indexes.find(
  (index) => index.name === "purchaseId_1" && !index.partialFilterExpression,
);

if (legacy) {
  await rewards.dropIndex("purchaseId_1");
  console.log("Dropped legacy unique index purchaseId_1");
}

await rewards.createIndex(
  { purchaseId: 1 },
  {
    unique: true,
    partialFilterExpression: { purchaseId: { $type: "objectId" } },
  },
);
console.log("Ensured partial unique index on purchaseId");

await mongoose.disconnect();
