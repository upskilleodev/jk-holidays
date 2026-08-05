"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    await fetch(`/api/admin/cashback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status === "paid" || status === "cancelled") {
    return <p className="text-xs text-stone py-1">No further actions</p>;
  }

  return (
    <div className="stack-actions">
      {status === "pending" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus("approved")}
          className="btn-dark w-full"
        >
          Approve
        </button>
      ) : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("paid")}
        className="btn-primary w-full"
      >
        Mark paid
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("cancelled")}
        className="btn-ghost w-full !border-danger/40 !text-danger col-span-full"
      >
        Cancel
      </button>
    </div>
  );
}
