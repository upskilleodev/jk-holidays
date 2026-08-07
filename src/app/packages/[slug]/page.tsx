import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { Package } from "@/models/Package";
import { Purchase } from "@/models/Purchase";
import { SiteShell } from "@/components/layout/SiteShell";
import { PurchaseRequestButton } from "@/components/packages/PurchaseRequestButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const pkg = await Package.findOne({ slug, status: "published" });
  if (!pkg) return { title: "Membership Plan" };
  return {
    title: pkg.title,
    description: pkg.summary,
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const session = await getMemberSession();

  const pkg = await Package.findOne({ slug, status: "published" }).lean();
  if (!pkg) notFound();

  let purchase = null;
  if (session) {
    purchase = await Purchase.findOne({ userId: session.userId }).lean();
  }

  return (
    <SiteShell>
      <section className="relative min-h-[52vh] overflow-hidden bg-navy-deep text-white sm:min-h-[60vh]">
        <Image
          src={pkg.coverImage || "/assets/hero-resort.jpg"}
          alt={pkg.title}
          fill
          priority
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/70 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-12 sm:pt-28 sm:pb-16">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-gold">
            {pkg.destination}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl max-w-3xl">
            {pkg.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/85">
            {pkg.summary}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:gap-10">
          <aside
            id="request"
            className="order-1 lg:order-2 h-fit rounded-xl border bg-white p-6 shadow-sm space-y-5 lg:sticky lg:top-28"
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {pkg.duration}
                {pkg.validity ? ` · ${pkg.validity}` : ""}
              </div>
              <div className="mt-3 flex items-end gap-3">
                {pkg.originalPrice ? (
                  <span className="line-through text-muted-foreground text-sm">
                    {formatINR(pkg.originalPrice)}
                  </span>
                ) : null}
                <span className="font-display text-4xl font-bold text-navy">
                  {formatINR(pkg.price)}
                </span>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">Loading...</div>
              }
            >
              <PurchaseRequestButton
                packageId={String(pkg._id)}
                packageSlug={pkg.slug}
                isLoggedIn={Boolean(session && session.role === "user")}
                hasPurchase={Boolean(purchase)}
                purchaseStatus={purchase?.status || null}
              />
            </Suspense>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Purchase is inquiry-based. After you request, admin collects
              payment manually and activates your membership plan.
            </p>
          </aside>

          <div className="order-2 lg:order-1">
            <div className="text-xs font-bold tracking-[0.3em] text-navy uppercase">
              ━━ Membership Plan ━━
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy">
              What&apos;s included
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
              {pkg.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {((pkg.inclusions as string[]) || []).map((item: string) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-xl border bg-white px-4 py-3 text-sm"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {((pkg.images as string[]) || []).length > 0 ? (
              <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {((pkg.images as string[]) || []).map((src: string) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl"
                  >
                    <Image
                      src={src}
                      alt={pkg.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
