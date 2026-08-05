import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { Purchase } from "@/models/Purchase";
import { PurchaseActions } from "@/components/admin/PurchaseActions";

export const dynamic = "force-dynamic";

export default async function AdminPurchasesPage() {
  await connectDB();
  const purchases = await Purchase.find()
    .populate("userId", "name email")
    .populate("packageId", "title")
    .sort({ createdAt: -1 });

  return (
    <div>
      <div className="eyebrow !text-stone">Operations</div>
      <h1 className="mt-2 page-title">Purchase requests</h1>
      <p className="mt-3 text-sm text-stone leading-relaxed">
        Collect payment manually, then tap approve to activate the membership.
      </p>

      <div className="mt-6 space-y-3">
        {purchases.length === 0 ? (
          <div className="mobile-card text-sm text-stone">No purchase requests yet.</div>
        ) : (
          purchases.map((purchase) => {
            const user = purchase.userId as unknown as {
              name?: string;
              email?: string;
            };
            const pkg = purchase.packageId as unknown as { title?: string };

            return (
              <article key={String(purchase._id)} className="mobile-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-medium truncate">{user?.name || "Member"}</h2>
                    <p className="mt-0.5 text-xs text-stone break-all">
                      {user?.email}
                    </p>
                  </div>
                  <span className={`status-pill status-${purchase.status} shrink-0`}>
                    {purchase.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[10px] tracking-[0.14em] uppercase text-stone">
                      Plan
                    </div>
                    <div className="mt-1 font-medium">{pkg?.title}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.14em] uppercase text-stone">
                      Amount
                    </div>
                    <div className="mt-1 font-display text-xl">
                      {formatINR(purchase.priceSnapshot)}
                    </div>
                  </div>
                </div>

                {purchase.referralCodeUsed ? (
                  <p className="mt-3 text-xs text-stone">
                    Referral: {purchase.referralCodeUsed}
                  </p>
                ) : null}

                <div className="mt-4">
                  <PurchaseActions
                    id={String(purchase._id)}
                    status={purchase.status}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
