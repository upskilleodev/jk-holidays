import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Check,
  Crown,
  Gift,
  Headphones,
  MapPin,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { destinations } from "@/lib/site";
import { getMembershipValidity } from "@/lib/membership";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";
import { CashbackReward } from "@/models/CashbackReward";
import { HolidayRequest } from "@/models/HolidayRequest";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { CopyReferralButton } from "@/components/dashboard/CopyReferralButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

const FALLBACK_IMAGE = "/assets/hero-resort.jpg";

const bookingStatusStyles: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  approved: "bg-sky-100 text-sky-700",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-rose-100 text-rose-700",
};

const bookingStatusLabels: Record<string, string> = {
  completed: "Completed",
  approved: "Confirmed",
  pending: "Pending",
  rejected: "Rejected",
};

function imageForDestination(destination: string) {
  const match = destinations.find(
    (d) => d.name.toLowerCase() === destination.trim().toLowerCase(),
  );
  return match?.image || FALLBACK_IMAGE;
}

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default async function DashboardPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard");

  await connectDB();
  const user = await User.findById(session.userId).select("-passwordHash");
  if (!user) redirect("/login?next=/dashboard");

  const purchase = await Purchase.findOne({ userId: session.userId }).populate(
    "packageId",
  );
  const rewards = await CashbackReward.find({
    referrerUserId: session.userId,
  }).sort({ createdAt: -1 });

  const recentRequests = await HolidayRequest.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean<
      Array<{
        _id: { toString(): string };
        destination: string;
        checkIn: string;
        checkOut: string;
        nightsLabel?: string;
        status: string;
      }>
    >();

  const recentBookings = recentRequests.map((r) => ({
    id: r._id.toString(),
    dest: r.destination,
    nights: r.nightsLabel || "—",
    dates:
      r.status === "pending"
        ? "Awaiting confirmation"
        : `${shortDate(r.checkIn)} – ${shortDate(r.checkOut)}`,
    status: r.status,
    image: imageForDestination(r.destination),
  }));

  const walletBalance = user.referralPoints || 0;

  const pkg = purchase?.packageId as
    | {
        title?: string;
        duration?: string;
        slug?: string;
        validity?: string;
        destination?: string;
        badge?: string;
      }
    | null
    | undefined;

  const planName =
    pkg?.badge || pkg?.title?.split(" ")[0] || (purchase ? "Member" : "None");
  const isActive = purchase?.status === "active";
  const isPending = purchase?.status === "pending";
  const {
    daysLeft: left,
    validTill,
    progress,
  } = getMembershipValidity({
    status: purchase?.status,
    approvedAt: purchase?.approvedAt,
    createdAt: purchase?.createdAt,
    validity: pkg?.validity,
  });

  const validityFoot = isActive
    ? `Valid Till ${validTill}`
    : isPending
      ? "Starts once your plan is activated"
      : "Choose a membership plan";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src="/assets/hero-resort.jpg"
          alt=""
          width={1400}
          height={360}
          className="h-40 w-full object-cover sm:h-44"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/75 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-5 text-white sm:px-8">
          <div className="text-sm text-white/85">Welcome Back,</div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {user.name} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm text-white/80">
            Let&apos;s plan your next perfect holiday!
          </p>
        </div>
      </div>

      {purchase?.status === "pending" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div>
            <div className="font-semibold text-amber-950">
              Complete membership payment
            </div>
            <p className="mt-0.5 text-sm text-amber-900/80">
              Scan QR or use bank transfer — then admin will activate your plan.
            </p>
          </div>
          <Link
            href="/dashboard/membership"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-navy px-4 text-sm font-bold text-white"
          >
            Pay now
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-navy-gradient p-5 text-white shadow-sm">
          <div className="text-sm text-white/80">My Membership</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-2xl font-bold">{planName}</div>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300"
                    : purchase
                      ? "bg-amber-500/20 text-amber-200"
                      : "bg-white/10 text-white/70"
                }`}
              >
                ●{" "}
                {isActive
                  ? "Active"
                  : purchase
                    ? purchase.status
                    : "Not started"}
              </span>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-gold text-gold">
              <Crown className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-white/70">
            {isActive ? (
              <>
                Valid Till
                <br />
                <span className="text-white">{validTill}</span>
              </>
            ) : (
              <span className="text-white/80">
                {isPending
                  ? "Validity starts after activation"
                  : "No active membership"}
              </span>
            )}
          </div>
          <Link
            href="/dashboard/membership"
            className="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-white/10 text-xs font-bold tracking-wide hover:bg-white/20"
          >
            VIEW DETAILS
          </Link>
        </div>

        <PortalStatCard
          icon={Calendar}
          tone="blue"
          title="Membership Validity"
          value={isActive ? String(left) : "—"}
          sub={isActive ? "Days Left" : "Not active yet"}
          foot={validityFoot}
          progress={isActive ? progress : 0}
        />
        <PortalStatCard
          icon={Briefcase}
          tone="emerald"
          title="Available Holiday"
          value={isActive ? "1" : "0"}
          sub="Trip Left"
          foot={
            isActive
              ? pkg?.duration || undefined
              : "Activate membership to unlock"
          }
          cta={isActive ? "BOOK NOW" : "VIEW PLANS"}
          ctaHref={isActive ? "/dashboard/request" : "/dashboard/membership"}
        />
        <PortalStatCard
          icon={Wallet}
          tone="violet"
          title="My Wallet"
          value={formatINR(walletBalance)}
          sub="Available Balance"
          cta="ADD MONEY"
          ctaHref="/dashboard/wallet"
          ctaOutline
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-navy-deep text-white shadow-sm">
          <Image
            src="/assets/next-holiday.jpg"
            alt=""
            width={900}
            height={420}
            className="h-56 w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/50 to-transparent" />
          <div className="absolute inset-x-0 top-4 px-5 font-display text-xl font-bold">
            Next Eligible Holiday
          </div>
          <div className="relative -mt-24 p-5">
            {isActive ? (
              <>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4 text-gold" />
                  {pkg?.destination || "Choose from our destinations"}
                </div>
                {pkg?.duration ? (
                  <div className="mt-2 text-xs text-white/80">
                    {pkg.duration}
                  </div>
                ) : null}
                <div className="mt-1 text-xs text-white/80">
                  Valid Till: {validTill}
                </div>
              </>
            ) : (
              <div className="text-sm text-white/85">
                {purchase?.status === "pending"
                  ? "Your membership is awaiting activation."
                  : "Activate a membership plan to unlock your holidays."}
              </div>
            )}
            <Link
              href={isActive ? "/dashboard/resorts" : "/dashboard/membership"}
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-gold-gradient px-5 text-xs font-bold text-navy-deep"
            >
              {isActive ? "EXPLORE RESORTS" : "VIEW PLANS"}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-navy">
              Recent Bookings
            </h3>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-semibold text-blue-600"
            >
              View All
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-cream/40 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "You have not requested a holiday yet."
                  : "Activate your membership to request your first holiday."}
              </p>
              <Link
                href={isActive ? "/dashboard/request" : "/dashboard/membership"}
                className="mt-3 inline-flex text-sm font-semibold text-blue-600"
              >
                {isActive ? "Request Holiday" : "View membership plans"}
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4">
                  <Image
                    src={b.image}
                    alt={b.dest}
                    width={80}
                    height={56}
                    className="h-14 w-20 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-semibold text-navy">
                        {b.dest}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          bookingStatusStyles[b.status] ||
                          bookingStatusStyles.pending
                        }`}
                      >
                        {bookingStatusLabels[b.status] || "Pending"}
                        {b.status === "completed" || b.status === "approved" ? (
                          <Check className="h-3 w-3" />
                        ) : null}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.nights}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.dates}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/bookings"
            className="mt-4 block text-center text-sm font-semibold text-blue-600"
          >
            View All Bookings →
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-navy-gradient text-white shadow-sm">
        <Image
          src="/assets/upgrade-banner.jpg"
          alt=""
          width={900}
          height={320}
          className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/80 to-transparent" />
        <div className="relative flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-2xl font-bold">
              Upgrade to Platinum Membership
            </h3>
            <p className="mt-1 max-w-lg text-sm text-white/80">
              Get 10 Nights / 11 Days holidays with 5 years validity &amp; FREE
              Bali or Thailand Trip.
            </p>
            <Link
              href="/packages"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-gold-gradient px-5 text-xs font-bold text-navy-deep"
            >
              UPGRADE NOW
            </Link>
          </div>
          <div className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold">
            BEST VALUE
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Users,
            title: "Refer & Earn",
            desc: "Invite friends, help them join and earn exciting rewards.",
            cta: "VIEW DETAILS",
            href: "/dashboard/refer",
            color: "text-blue-500",
          },
          {
            icon: Gift,
            title: "My Rewards",
            desc: "You have earned exciting rewards. Redeem them now!",
            cta: "REDEEM NOW",
            href: "/dashboard/rewards",
            color: "text-rose-500",
          },
          {
            icon: Tag,
            title: "Exclusive Offers",
            desc: "Grab the latest offers and make your holidays more memorable.",
            cta: "VIEW OFFERS",
            href: "/dashboard/offers",
            color: "text-amber-500",
          },
          {
            icon: Headphones,
            title: "Travel Support",
            desc: "Our support team is available 24/7 to assist you.",
            cta: "CONTACT NOW",
            href: "/dashboard/support",
            color: "text-cyan-500",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <Icon className={`h-8 w-8 ${item.color}`} />
              <h4 className="mt-3 font-display text-base font-bold text-navy">
                {item.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              <Link
                href={item.href}
                className="mt-3 flex h-9 w-full items-center justify-center rounded-lg border border-border text-xs font-bold text-navy hover:bg-muted"
              >
                {item.cta}
              </Link>
            </div>
          );
        })}
      </div>

      <div
        id="referral"
        className="scroll-mt-24 rounded-2xl border bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-navy">
              Your Referral Code
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Share via WhatsApp or Instagram. Cashback is recorded when a
              friend&apos;s purchase is approved.
            </p>
          </div>
          <div className="rounded-md border border-gold/40 bg-cream px-4 py-3 font-display text-xl tracking-[0.18em]">
            {user.referralCode}
          </div>
        </div>
        <CopyReferralButton code={user.referralCode} />
        {rewards.length > 0 ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {rewards.slice(0, 4).map((reward) => (
              <li
                key={String(reward._id)}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
              >
                <span className="font-medium">{formatINR(reward.amount)}</span>
                <span className="text-xs capitalize text-muted-foreground">
                  {reward.status}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-navy">
            Popular Destinations
          </h3>
          <Link
            href="/dashboard/holidays"
            className="text-xs font-semibold text-blue-600"
          >
            View All
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          {destinations.map((d) => (
            <Link
              key={d.name}
              href="/dashboard/holidays"
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={d.image}
                alt={d.name}
                fill
                className="object-cover"
                sizes="120px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
              <div className="absolute bottom-2 left-2 text-white">
                <div className="text-xs font-bold">{d.name}</div>
                <div className="text-[10px]">{d.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
