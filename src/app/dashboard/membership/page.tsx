import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Crown } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { formatINR, cn } from "@/lib/utils";
import { Package } from "@/models/Package";
import { Purchase } from "@/models/Purchase";
import { PaymentInstructions } from "@/components/packages/PaymentInstructions";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Membership" };

function daysRemaining(from: Date, years = 2) {
  const end = new Date(from);
  end.setFullYear(end.getFullYear() + years);
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
}

function validTillLabel(from: Date, years = 2) {
  const end = new Date(from);
  end.setFullYear(end.getFullYear() + years);
  return end.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function MembershipPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/membership");

  await connectDB();
  const [purchase, plans] = await Promise.all([
    Purchase.findOne({ userId: session.userId }).populate("packageId"),
    Package.find({ status: "published" }).sort({ sortOrder: 1, price: 1 }),
  ]);

  const pkg = purchase?.packageId as
    | {
        _id?: { toString(): string };
        title?: string;
        duration?: string;
        slug?: string;
        validity?: string;
        badge?: string;
        price?: number;
      }
    | null
    | undefined;

  const startDate =
    purchase?.approvedAt || purchase?.createdAt || new Date();
  const left = purchase ? daysRemaining(new Date(startDate)) : 0;
  const till = purchase ? validTillLabel(new Date(startDate)) : null;
  const currentTitle = pkg?.title || null;
  const currentId = pkg?._id ? String(pkg._id) : null;
  const isActive = purchase?.status === "active";
  const isPending = purchase?.status === "pending";
  const payAmount = purchase?.priceSnapshot || pkg?.price || null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">
        My Membership
      </h1>

      <div className="rounded-2xl bg-navy-gradient p-6 text-white shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-gold text-gold">
            <Crown className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-white/80">Current Plan</div>
            {purchase && currentTitle ? (
              <>
                <div className="font-display text-2xl font-bold text-gold sm:text-3xl">
                  {currentTitle}
                </div>
                <div className="mt-1 text-sm text-white/85">
                  {isActive && till
                    ? `Valid Till: ${till} · ${left} Days Remaining`
                    : isPending
                      ? "Pending activation — complete payment below"
                      : `Status: ${purchase.status}`}
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-2xl font-bold text-gold sm:text-3xl">
                  No active plan
                </div>
                <div className="mt-1 text-sm text-white/85">
                  Choose a membership below to get started.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isPending ? (
        <PaymentInstructions amount={payAmount} planTitle={currentTitle} />
      ) : null}

      <h2 className="font-display text-2xl font-bold text-navy">
        Upgrade Options
      </h2>

      {plans.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-sm text-muted-foreground shadow-sm">
          No membership plans published yet.{" "}
          <Link href="/packages" className="font-semibold text-blue-600">
            Browse packages
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const features = (
              (plan.highlights?.length ? plan.highlights : plan.inclusions) ||
              []
            ).slice(0, 5);
            const isCurrent =
              currentId === String(plan._id) ||
              (!!currentTitle &&
                currentTitle.toLowerCase() === plan.title.toLowerCase());

            return (
              <article
                key={String(plan._id)}
                className={cn(
                  "flex flex-col rounded-2xl border bg-white p-5 shadow-sm",
                  isCurrent && "border-gold ring-1 ring-gold/40",
                )}
              >
                <div className="font-display text-xl font-bold text-navy">
                  {plan.badge || plan.title}
                </div>
                <div className="mt-2 font-display text-2xl font-bold text-gold">
                  {formatINR(plan.price)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {[plan.duration, plan.validity].filter(Boolean).join(" · ")}
                </div>

                <ul className="mt-4 flex-1 space-y-2 text-sm text-navy">
                  {features.length > 0 ? (
                    features.map((f: string) => (
                      <li key={f} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        <span>{f}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>Premium resort stay benefits</span>
                    </li>
                  )}
                </ul>

                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-navy px-4 text-sm font-bold text-white opacity-90"
                  >
                    {isPending ? "Awaiting payment review" : "Current Plan"}
                  </button>
                ) : (
                  <Link
                    href={`/packages/${plan.slug}`}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-navy px-4 text-sm font-bold text-white hover:bg-navy-soft"
                  >
                    {purchase ? "Upgrade" : "Choose Plan"}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
