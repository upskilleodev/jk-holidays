import Link from "next/link";
import {
  Crown,
  Plane,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { User } from "@/models/User";
import { Package } from "@/models/Package";
import { Purchase } from "@/models/Purchase";
import { CashbackReward } from "@/models/CashbackReward";
import { ContactMessage } from "@/models/ContactMessage";
import { PortalStatCard } from "@/components/portal/PortalStatCard";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await connectDB();
  const [
    users,
    packages,
    pending,
    active,
    cashbackPending,
    cashbackSum,
    recentPurchases,
    recentUsers,
    tickets,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Package.countDocuments(),
    Purchase.countDocuments({ status: "pending" }),
    Purchase.countDocuments({ status: "active" }),
    CashbackReward.countDocuments({ status: "pending" }),
    CashbackReward.aggregate([
      { $match: { status: { $in: ["approved", "paid"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Purchase.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .populate("packageId", "title"),
    User.find({ role: "user" }).sort({ createdAt: -1 }).limit(4).select("name referralCode createdAt"),
    ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name message createdAt"),
  ]);

  const revenuePaid = cashbackSum[0]?.total || 0;

  const activity: { text: string; when: string }[] = [
    ...recentUsers.map((u) => ({
      text: `New member registered: ${u.name} (${u.referralCode})`,
      when: relativeTime(u.createdAt),
    })),
    ...recentPurchases.map((p) => {
      const member = p.userId as { name?: string } | null;
      const pkg = p.packageId as { title?: string } | null;
      return {
        text: `Holiday request ${pkg?.title || "plan"} — ${member?.name || "Member"} (${p.status})`,
        when: relativeTime(p.createdAt),
      };
    }),
    ...tickets.map((t) => ({
      text: `Support ticket from ${t.name}: ${
        t.message?.slice(0, 48) || "New enquiry"
      }${t.message && t.message.length > 48 ? "…" : ""}`,
      when: relativeTime(t.createdAt),
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-navy-gradient p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
        <div className="relative">
          <div className="text-sm text-white/75">Admin Console</div>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Welcome back
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            Members, plans, holiday requests, resorts, wallet, and support — in
            one place.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PortalStatCard
          icon={Users}
          tone="blue"
          title="Total Members"
          value={String(users)}
          sub="Registered members"
          foot={`${active} active memberships`}
          cta="VIEW MEMBERS"
          ctaHref="/admin/users"
        />
        <PortalStatCard
          icon={Crown}
          tone="amber"
          title="Membership Plans"
          value={String(packages)}
          sub="Published & draft"
          cta="MANAGE PLANS"
          ctaHref="/admin/packages"
        />
        <PortalStatCard
          icon={Plane}
          tone="emerald"
          title="Pending Requests"
          value={String(pending)}
          sub="Awaiting approval"
          cta="REVIEW NOW"
          ctaHref="/admin/purchases"
        />
        <PortalStatCard
          icon={Wallet}
          tone="violet"
          title="Cashback Ledger"
          value={formatINR(revenuePaid)}
          sub={`${cashbackPending} pending payouts`}
          cta="OPEN WALLET"
          ctaHref="/admin/wallet"
          ctaOutline
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-navy">
              Recent Activity
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> Live
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            ) : (
              activity.map((item, i) => (
                <div
                  key={`${item.text}-${i}`}
                  className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-navy">{item.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.when}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-navy">
            Quick Actions
          </h3>
          <div className="mt-4 grid gap-2">
            {[
              { href: "/admin/purchases", label: "Review holiday requests" },
              { href: "/admin/packages/new", label: "Create new plan" },
              { href: "/admin/resorts", label: "Manage resorts" },
              { href: "/admin/tickets", label: "Support tickets" },
              { href: "/admin/users", label: "Browse members" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex h-11 items-center justify-between rounded-xl border px-4 text-sm font-semibold text-navy hover:border-gold hover:bg-cream/40"
              >
                {a.label}
                <span className="text-gold">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function relativeTime(date: Date | string | undefined) {
  if (!date) return "";
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
