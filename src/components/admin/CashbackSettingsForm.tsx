"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initial: {
    type: "fixed" | "percentage";
    value: number;
    isActive: boolean;
  };
};

export function CashbackSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"fixed" | "percentage">(initial.type);
  const [value, setValue] = useState(initial.value);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/cashback", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value: Number(value), isActive }),
    });
    setLoading(false);
    if (!res.ok) {
      setMessage("Unable to save settings");
      return;
    }
    setMessage("Cashback settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mobile-card space-y-4">
      <div className="space-y-3">
        <label className="block text-[10px] tracking-[0.14em] uppercase text-stone">
          Cashback type
        </label>
        <select
          className="input-field"
          value={type}
          onChange={(e) => setType(e.target.value as "fixed" | "percentage")}
        >
          <option value="fixed">Fixed amount (INR)</option>
          <option value="percentage">Percentage of purchase</option>
        </select>
      </div>
      <div className="space-y-3">
        <label className="block text-[10px] tracking-[0.14em] uppercase text-stone">
          Value
        </label>
        <input
          className="input-field"
          type="number"
          inputMode="numeric"
          min={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          required
        />
      </div>
      <label className="flex min-h-12 items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Cashback program active
      </label>
      {message ? <p className="text-sm text-success">{message}</p> : null}
      <button type="submit" disabled={loading} className="btn-dark w-full">
        {loading ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
