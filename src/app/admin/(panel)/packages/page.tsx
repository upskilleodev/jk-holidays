import Link from "next/link";
import { Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Package } from "@/models/Package";
import {
  AdminPlansGrid,
  type AdminPlanCard,
} from "@/components/admin/AdminPlansGrid";

export const dynamic = "force-dynamic";
export const metadata = { title: "Membership Plans" };

export default async function AdminPackagesPage() {
  await connectDB();
  const packages = await Package.find().sort({ sortOrder: 1, createdAt: -1 });

  const plans: AdminPlanCard[] = packages.map((pkg) => ({
    id: String(pkg._id),
    title: pkg.title,
    price: pkg.price,
    duration: pkg.duration,
    validity: pkg.validity || "",
    status: pkg.status === "published" ? "published" : "draft",
    isFeatured: Boolean(pkg.isFeatured),
    badge: pkg.badge || "",
    coverImage: pkg.coverImage || "",
    inclusionsCount: (pkg.inclusions || []).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            Membership Plans
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dashboard › Membership Plans
          </p>
        </div>
        <Link
          href="/admin/packages/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-soft"
        >
          <Plus className="h-4 w-4" />
          Add Plan
        </Link>
      </div>

      <AdminPlansGrid plans={plans} />
    </div>
  );
}
