import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { Purchase } from "@/models/Purchase";

export const metadata = { title: "My Membership" };

export default async function MembershipPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/membership");

  await connectDB();
  const purchase = await Purchase.findOne({ userId: session.userId }).populate(
    "packageId",
  );
  const pkg = purchase?.packageId as
    | {
        title?: string;
        duration?: string;
        slug?: string;
        validity?: string;
        destination?: string;
      }
    | null
    | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          My Membership
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your plan details, status, and purchase information.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        {purchase && pkg ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Current plan
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold text-navy">
                  {pkg.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pkg.duration}
                  {pkg.destination ? ` · ${pkg.destination}` : ""}
                </p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-gold text-gold">
                <Crown className="h-6 w-6" />
              </div>
            </div>
            <span className={`status-pill status-${purchase.status}`}>
              {purchase.status}
            </span>
            <div className="font-display text-3xl font-bold text-navy">
              {formatINR(purchase.priceSnapshot)}
            </div>
            {purchase.referralCodeUsed ? (
              <p className="text-sm text-muted-foreground">
                Referral used: {purchase.referralCodeUsed}
              </p>
            ) : null}
            {purchase.status === "pending" ? (
              <p className="text-sm text-muted-foreground">
                Request received. We&apos;ll collect payment and activate your
                membership soon.
              </p>
            ) : null}
            {pkg.slug ? (
              <Link href={`/packages/${pkg.slug}`} className="btn-navy mt-2">
                View plan
              </Link>
            ) : null}
          </div>
        ) : (
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">
              No membership yet
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Browse membership plans and submit one purchase request to get
              started.
            </p>
            <Link href="/packages" className="btn-primary mt-5 inline-flex">
              Explore membership plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
