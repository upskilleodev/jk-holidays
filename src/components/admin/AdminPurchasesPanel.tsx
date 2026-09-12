"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PurchaseActions } from "@/components/admin/PurchaseActions";
import { formatINR } from "@/lib/utils";

export type AdminPurchaseRow = {
  id: string;
  memberName: string;
  memberEmail: string;
  planTitle: string;
  amount: number;
  status: string;
  referralCodeUsed: string;
};

export function AdminPurchasesPanel({
  purchases,
}: {
  purchases: AdminPurchaseRow[];
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return purchases;
    return purchases.filter((p) =>
      [
        p.memberName,
        p.memberEmail,
        p.planTitle,
        p.status,
        p.referralCodeUsed,
        String(p.amount),
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term)),
    );
  }, [purchases, q]);

  return (
    <div>
      <div className="eyebrow !text-stone">Operations</div>
      <h1 className="mt-2 page-title">Plan Purchases</h1>
      <p className="mt-3 text-sm text-stone leading-relaxed">
        Collect payment manually, then approve to activate the membership plan.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input-field pl-9"
            placeholder="Search by member, email, plan, status or amount"
          />
        </div>
        <span className="text-xs text-stone">
          {filtered.length} of {purchases.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="mobile-card text-sm text-stone">
            {purchases.length === 0
              ? "No purchase requests yet."
              : "No purchases match your search."}
          </div>
        ) : (
          filtered.map((purchase) => (
            <article key={purchase.id} className="mobile-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-medium">
                    {purchase.memberName}
                  </h2>
                  <p className="mt-0.5 break-all text-xs text-stone">
                    {purchase.memberEmail}
                  </p>
                </div>
                <span
                  className={`status-pill status-${purchase.status} shrink-0`}
                >
                  {purchase.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] tracking-[0.14em] uppercase text-stone">
                    Plan
                  </div>
                  <div className="mt-1 font-medium">{purchase.planTitle}</div>
                </div>
                <div>
                  <div className="text-[10px] tracking-[0.14em] uppercase text-stone">
                    Amount
                  </div>
                  <div className="mt-1 font-display text-xl">
                    {formatINR(purchase.amount)}
                  </div>
                </div>
              </div>

              {purchase.referralCodeUsed ? (
                <p className="mt-3 text-xs text-stone">
                  Referral: {purchase.referralCodeUsed}
                </p>
              ) : null}

              <div className="mt-4">
                <PurchaseActions id={purchase.id} status={purchase.status} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
