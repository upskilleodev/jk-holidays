import { connectDB } from "@/lib/db";
import { Package } from "@/models/Package";
import { SiteShell } from "@/components/layout/SiteShell";
import { PackageCard } from "@/components/packages/PackageCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Membership Plans",
  description: "Choose from Silver, Gold, or Platinum holiday membership plans.",
};

export default async function MembershipPage() {
  await connectDB();
  const packages = await Package.find({ status: "published" })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return (
    <SiteShell>
      <section className="bg-navy-gradient py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-center font-display text-4xl font-bold">
            Our Membership Plans
          </h1>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard
                key={String(pkg._id)}
                pkg={{
                  _id: String(pkg._id),
                  title: pkg.title,
                  slug: pkg.slug,
                  summary: pkg.summary,
                  price: pkg.price,
                  originalPrice: pkg.originalPrice,
                  duration: pkg.duration,
                  validity: pkg.validity,
                  coverImage: pkg.coverImage,
                  badge: pkg.badge,
                  inclusions: pkg.inclusions,
                  isFeatured: Boolean(pkg.isFeatured),
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
