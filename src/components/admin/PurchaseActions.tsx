"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PurchaseActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(nextStatus: "active" | "rejected" | "cancelled") {
    const note =
      nextStatus === "active"
        ? "Payment collected manually and purchase activated."
        : window.prompt("Optional admin note") || "";

    setLoading(true);
    await fetch(`/api/purchases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, adminNote: note }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status !== "pending") {
    return (
      <p className="text-xs text-stone py-2">
        This request is already {status}.
      </p>
    );
  }

  return (
    <div className="stack-actions">
      <button
        type="button"
        disabled={loading}
        onClick={() => update("active")}
        className="btn-primary w-full"
      >
        {loading ? "Updating..." : "Approve & activate"}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => update("rejected")}
        className="btn-ghost w-full !border-danger/40 !text-danger"
      >
        Reject
      </button>
    </div>
  );
}
