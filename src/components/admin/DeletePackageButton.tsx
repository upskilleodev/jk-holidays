"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePackageButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this membership plan?")) return;
    setLoading(true);
    await fetch(`/api/packages/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="btn-ghost w-full !border-danger/40 !text-danger"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
