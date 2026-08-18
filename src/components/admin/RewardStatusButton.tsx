"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/feedback/toast";

export function RewardStatusButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: "approved" | "paid" | "cancelled") {
    setLoading(true);
    const res = await fetch(`/api/admin/cashback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (!res.ok) {
      toast("Could not update payment status", "error");
      return;
    }
    toast(
      next === "approved"
        ? "Reward approved"
        : next === "paid"
          ? "Marked as paid"
          : "Reward cancelled",
      next === "cancelled" ? "info" : "success",
    );
    router.refresh();
  }

  if (status === "paid" || status === "cancelled") {
    return (
      <p className="py-1 text-center text-[11px] text-muted-foreground">
        Settled
      </p>
    );
  }

  return (
    <div className="grid gap-1.5">
      {status === "pending" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus("approved")}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-navy px-3 text-xs font-bold text-white hover:bg-navy-soft disabled:opacity-55"
        >
          Approve
        </button>
      ) : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("paid")}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold-gradient px-3 text-xs font-bold text-navy-deep disabled:opacity-55"
      >
        Mark paid
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("cancelled")}
        className="inline-flex h-8 items-center justify-center rounded-lg border border-danger/30 px-3 text-[11px] font-semibold text-danger hover:bg-red-50 disabled:opacity-55"
      >
        Cancel
      </button>
    </div>
  );
}
