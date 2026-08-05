import { connectDB } from "@/lib/db";
import { Package } from "@/models/Package";
import { SiteShell } from "@/components/layout/SiteShell";
import { PackageCard } from "@/components/packages/PackageCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Membership Plans",
  description:
    "Browse JK Holidays luxury membership plans and their travel benefits.",
};

export default async function PackagesPage() {
  await connectDB();
  const packages = await Package.find({ status: "published" })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return (
    <SiteShell>
      <section className="bg-navy-gradient py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-xs font-bold tracking-[0.3em] text-gold">
            ━━ MEMBERSHIP PLANS ━━
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold max-w-3xl">
            Membership plans built around real travel benefits
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/80">
            Explore plans with hotel stays, food, trekking, and tourism
            activities. Guests can browse freely — purchase requests require an
            account.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </SiteShell>
  );
}
