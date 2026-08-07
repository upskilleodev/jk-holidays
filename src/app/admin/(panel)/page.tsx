import Link from "next/link";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Package } from "@/models/Package";
import { Purchase } from "@/models/Purchase";
import { CashbackReward } from "@/models/CashbackReward";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await connectDB();
  const [users, packages, pending, active, cashbackPending] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Package.countDocuments(),
    Purchase.countDocuments({ status: "pending" }),
    Purchase.countDocuments({ status: "active" }),
    CashbackReward.countDocuments({ status: "pending" }),
  ]);

  const cards = [
    { label: "Members", value: users, href: "/admin/users", hint: "Registered members" },
    { label: "Plans", value: packages, href: "/admin/packages", hint: "Membership plans" },
    { label: "Requests", value: pending, href: "/admin/purchases", hint: "Holiday requests pending" },
    { label: "Active", value: active, href: "/admin/purchases", hint: "Live memberships" },
    { label: "Cashback", value: cashbackPending, href: "/admin/wallet", hint: "Pending payouts" },
  ];

  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.2em] text-navy uppercase sm:text-xs">
        Dashboard
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">
        Admin overview
      </h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:text-base">
        Members, plans, holiday requests, resorts, wallet, and support — in one console.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="mobile-card active:scale-[0.98] transition-transform min-h-[112px] flex flex-col justify-between"
          >
            <div className="text-[10px] sm:text-xs tracking-[0.14em] uppercase text-stone">
              {card.label}
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl">{card.value}</div>
              <div className="mt-1 text-[11px] text-stone">{card.hint}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/admin/purchases" className="btn-dark w-full">
          Review holiday requests
        </Link>
        <Link href="/admin/packages/new" className="btn-primary w-full">
          Create new plan
        </Link>
        <Link href="/admin/bookings" className="btn-ghost w-full !border-border !text-navy">
          Open bookings calendar
        </Link>
        <Link href="/admin/tickets" className="btn-ghost w-full !border-border !text-navy">
          Support tickets
        </Link>
      </div>
    </div>
  );
}
