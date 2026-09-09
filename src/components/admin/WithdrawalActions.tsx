"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/feedback/toast";
import { formatINR } from "@/lib/utils";

export function WithdrawalActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: "approved" | "rejected" | "paid") {
    setLoading(true);
    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error || "Could not update withdrawal", "error");
      return;
    }
    toast(
      next === "rejected"
        ? "Withdrawal rejected"
        : next === "paid"
          ? "Marked as paid"
          : "Withdrawal approved",
      next === "rejected" ? "info" : "success",
    );
    router.refresh();
  }

  if (status !== "pending" && status !== "approved") {
    return (
      <span className="text-[11px] text-muted-foreground capitalize">
        {status}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {status === "pending" ? (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStatus("approved")}
            className="rounded-lg bg-navy px-2.5 py-1.5 text-[10px] font-bold text-white disabled:opacity-55"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStatus("rejected")}
            className="rounded-lg border border-danger/30 px-2.5 py-1.5 text-[10px] font-bold text-danger disabled:opacity-55"
          >
            Reject
          </button>
        </>
      ) : null}
      {status === "approved" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus("paid")}
          className="rounded-lg bg-gold-gradient px-2.5 py-1.5 text-[10px] font-bold text-navy-deep disabled:opacity-55"
        >
          Mark paid
        </button>
      ) : null}
    </div>
  );
}
