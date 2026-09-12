import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, Lock } from "lucide-react";
import { getMemberSession } from "@/lib/auth";
import { getMembershipStatus } from "@/lib/membership";
import { HolidayRequestForm } from "@/components/dashboard/HolidayRequestForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Request Holiday" };

function MembershipGate({ pending }: { pending: boolean }) {
  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm md:p-10">
      <div
        className={
          pending
            ? "grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700"
            : "grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold"
        }
      >
        {pending ? (
          <Clock className="h-6 w-6" />
        ) : (
          <Lock className="h-6 w-6" />
        )}
      </div>
      <h2 className="mt-4 font-display text-2xl font-bold text-navy">
        {pending
          ? "Membership awaiting activation"
          : "Membership plan required"}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {pending
          ? "We have received your membership request. Once payment is confirmed and an admin activates your plan, you can start requesting holidays."
          : "Holiday requests are open to active members only. Purchase a membership plan to unlock destinations, resorts and booking requests."}
      </p>
      <Link href="/dashboard/membership" className="btn-navy mt-6 inline-flex">
        {pending ? "View payment details" : "Browse membership plans"}
      </Link>
    </div>
  );
}

export default async function RequestHolidayPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/request");

  const membership = await getMembershipStatus(session.userId);
  const isActive = membership === "active";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Request Holiday
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isActive
            ? "Book your next getaway in a few simple steps."
            : "Activate your membership to start planning your getaway."}
        </p>
      </div>

      {isActive ? (
        <Suspense
          fallback={
            <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
              Loading request form…
            </div>
          }
        >
          <HolidayRequestForm />
        </Suspense>
      ) : (
        <MembershipGate pending={membership === "pending"} />
      )}
    </div>
  );
}
