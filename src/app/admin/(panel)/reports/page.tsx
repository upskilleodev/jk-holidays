import Link from "next/link";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Package } from "@/models/Package";
import { Purchase } from "@/models/Purchase";
import { CashbackReward } from "@/models/CashbackReward";
import { formatINR } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  await connectDB();
  const [members, plans, pending, active, rewards] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Package.countDocuments({ status: "published" }),
    Purchase.countDocuments({ status: "pending" }),
    Purchase.countDocuments({ status: "active" }),
    CashbackReward.find().lean(),
  ]);
  const cashbackTotal = rewards.reduce((s, r) => s + (r.amount || 0), 0);

  const stats = [
    { label: "Members", value: String(members), href: "/admin/users" },
    { label: "Published plans", value: String(plans), href: "/admin/packages" },
    { label: "Pending requests", value: String(pending), href: "/admin/purchases" },
    { label: "Active memberships", value: String(active), href: "/admin/purchases" },
    { label: "Cashback issued", value: formatINR(cashbackTotal), href: "/admin/wallet" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Snapshot of membership, requests, and cashback performance."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="mobile-card transition hover:border-gold/40"
          >
            <div className="text-[10px] uppercase tracking-widest text-stone">
              {s.label}
            </div>
            <div className="mt-2 font-display text-3xl text-navy">{s.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
