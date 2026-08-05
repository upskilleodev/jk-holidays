import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";
import { CashbackReward } from "@/models/CashbackReward";
import { MemberShell } from "@/components/dashboard/MemberShell";
import { CopyReferralButton } from "@/components/dashboard/CopyReferralButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  if (session.role === "admin") redirect("/admin");

  await connectDB();
  const user = await User.findById(session.userId).select("-passwordHash");
  if (!user) redirect("/login");

  const purchase = await Purchase.findOne({ userId: session.userId }).populate(
    "packageId",
  );
  const rewards = await CashbackReward.find({
    referrerUserId: session.userId,
  }).sort({ createdAt: -1 });

  const pkg = purchase?.packageId as
    | {
        title?: string;
        duration?: string;
        slug?: string;
      }
    | null
    | undefined;

  return (
    <MemberShell name={user.name} referralCode={user.referralCode}>
      <div className="mb-6">
        <div className="text-xs font-bold tracking-[0.3em] text-navy uppercase">
          ━━ My Membership ━━
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-navy">
          Hello, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground break-all">
          {user.email}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Your purchase
          </div>
          {purchase && pkg ? (
            <div className="mt-3 space-y-3">
              <h2 className="font-display text-2xl font-bold text-navy">
                {pkg.title}
              </h2>
              <div className="text-sm text-muted-foreground">{pkg.duration}</div>
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
                  membership plan soon.
                </p>
              ) : null}
              {pkg.slug ? (
                <Link href={`/packages/${pkg.slug}`} className="btn-navy mt-2">
                  View plan
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-3">
              <h2 className="font-display text-2xl font-bold text-navy">
                No purchase yet
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

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Referral program
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold text-navy">
            Your referral code
          </h2>
          <div className="mt-4 rounded-md border border-gold/40 bg-cream px-4 py-4 text-center font-display text-2xl tracking-[0.18em]">
            {user.referralCode}
          </div>
          <CopyReferralButton code={user.referralCode} />
          <p className="mt-4 text-sm text-muted-foreground">
            Share this code. When a friend&apos;s purchase is approved, your
            cashback is recorded.
          </p>

          <div className="mt-6">
            <div className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
              Your cashback rewards
            </div>
            {rewards.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No rewards yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {rewards.map((reward) => (
                  <li
                    key={String(reward._id)}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-3 text-sm"
                  >
                    <span className="font-medium">
                      {formatINR(reward.amount)}
                    </span>
                    <span
                      className={`status-pill status-${
                        reward.status === "paid" || reward.status === "approved"
                          ? "active"
                          : reward.status === "cancelled"
                            ? "rejected"
                            : "pending"
                      }`}
                    >
                      {reward.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MemberShell>
  );
}
