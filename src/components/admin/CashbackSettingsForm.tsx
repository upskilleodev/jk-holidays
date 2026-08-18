"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Percent, IndianRupee, Sparkles } from "lucide-react";
import { toast } from "@/components/feedback/toast";
import { formatINR } from "@/lib/utils";

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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/cashback", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value: Number(value), isActive }),
    });
    setLoading(false);
    if (!res.ok) {
      toast("Unable to save settings", "error");
      return;
    }
    toast("Cashback settings saved", "success");
    router.refresh();
  }

  const preview =
    type === "fixed"
      ? formatINR(Number(value) || 0)
      : `${Number(value) || 0}% of purchase`;

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-3xl border bg-white shadow-sm"
    >
      <div className="border-b bg-navy-gradient px-5 py-5 text-white sm:px-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          Reward engine
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold">
          Cashback rules
        </h3>
        <p className="mt-1 text-sm text-white/70">
          Configure what referrers earn when a referred membership is approved.
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <div className="text-xs font-semibold text-navy">Cashback type</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setType("fixed")}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                type === "fixed"
                  ? "border-gold bg-cream/70 shadow-sm"
                  : "border-border hover:border-gold/50"
              }`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-gold">
                <IndianRupee className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-navy">
                  Fixed amount
                </span>
                <span className="text-xs text-muted-foreground">
                  Flat INR per referral
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setType("percentage")}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                type === "percentage"
                  ? "border-gold bg-cream/70 shadow-sm"
                  : "border-border hover:border-gold/50"
              }`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-gold">
                <Percent className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-navy">
                  Percentage
                </span>
                <span className="text-xs text-muted-foreground">
                  Of purchase value
                </span>
              </span>
            </button>
          </div>
        </div>

        <label className="block text-xs font-semibold text-navy">
          Value
          <input
            className="input-field mt-1.5"
            type="number"
            inputMode="numeric"
            min={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            required
          />
        </label>

        <div className="rounded-2xl border border-dashed border-gold/40 bg-cream/50 px-4 py-3">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Preview payout
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-navy">
            {preview}
          </div>
        </div>

        <label className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm">
          <span>
            <span className="block font-semibold text-navy">
              Program active
            </span>
            <span className="text-xs text-muted-foreground">
              Pause anytime without losing history
            </span>
          </span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-[oklch(0.78_0.12_85)]"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-navy w-full disabled:opacity-55"
        >
          {loading ? "Saving…" : "Save cashback settings"}
        </button>
      </div>
    </form>
  );
}
