import Link from "next/link";
import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { Package } from "@/models/Package";
import { DeletePackageButton } from "@/components/admin/DeletePackageButton";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  await connectDB();
  const packages = await Package.find().sort({ sortOrder: 1, createdAt: -1 });

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div>
          <div className="eyebrow !text-stone">Catalog</div>
          <h1 className="mt-2 page-title">Membership Plans</h1>
        </div>
        <Link href="/admin/packages/new" className="btn-dark w-full sm:w-auto sm:self-start">
          New plan
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {packages.length === 0 ? (
          <div className="mobile-card text-sm text-stone">No membership plans yet.</div>
        ) : (
          packages.map((pkg) => (
            <article key={String(pkg._id)} className="mobile-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl leading-tight truncate">
                    {pkg.title}
                  </h2>
                  <p className="mt-1 text-xs text-stone">{pkg.duration}</p>
                </div>
                <span
                  className={`status-pill shrink-0 ${
                    pkg.status === "published" ? "status-active" : "status-pending"
                  }`}
                >
                  {pkg.status}
                </span>
              </div>

              <div className="mt-4 font-display text-2xl">
                {formatINR(pkg.price)}
              </div>

              <div className="stack-actions mt-4">
                <Link
                  href={`/admin/packages/${pkg._id}/edit`}
                  className="btn-dark w-full"
                >
                  Edit
                </Link>
                <DeletePackageButton id={String(pkg._id)} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
