import { connectDB } from "@/lib/db";
import { Purchase } from "@/models/Purchase";
import {
  AdminPurchasesPanel,
  type AdminPurchaseRow,
} from "@/components/admin/AdminPurchasesPanel";

export const dynamic = "force-dynamic";

export default async function AdminPurchasesPage() {
  await connectDB();
  const purchases = await Purchase.find()
    .populate("userId", "name email")
    .populate("packageId", "title")
    .sort({ createdAt: -1 })
    .lean();

  const rows: AdminPurchaseRow[] = purchases.map((purchase) => {
    const user = purchase.userId as unknown as {
      name?: string;
      email?: string;
    } | null;
    const pkg = purchase.packageId as unknown as { title?: string } | null;

    return {
      id: String(purchase._id),
      memberName: user?.name || "Member",
      memberEmail: user?.email || "",
      planTitle: pkg?.title || "—",
      amount: purchase.priceSnapshot || 0,
      status: purchase.status || "pending",
      referralCodeUsed: purchase.referralCodeUsed || "",
    };
  });

  return <AdminPurchasesPanel purchases={rows} />;
}
