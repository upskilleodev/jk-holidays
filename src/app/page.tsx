import { connectDB } from "@/lib/db";
import { Package } from "@/models/Package";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/home/Hero";
import { WhySection } from "@/components/home/WhySection";
import { PackagesSection } from "@/components/home/PackagesSection";
import { DestinationsSection } from "@/components/home/DestinationsSection";
import { HowSection } from "@/components/home/HowSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ReferralSection } from "@/components/home/ReferralSection";
import { OffersSection } from "@/components/home/OffersSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();
  const packages = await Package.find({ status: "published" })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(3)
    .lean();

  const serialized = packages.map((pkg) => ({
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
  }));

  return (
    <SiteShell>
      <Hero />
      <WhySection />
      <PackagesSection packages={serialized} />
      <DestinationsSection />
      <HowSection />
      <TestimonialsSection />
      <ReferralSection />
      <OffersSection />
    </SiteShell>
  );
}
