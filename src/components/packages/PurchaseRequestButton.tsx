"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startNavigation, toast } from "@/components/feedback/toast";
import { FormEvent, useEffect, useState } from "react";

type Props = {
  packageId: string;
  packageSlug: string;
  isLoggedIn: boolean;
  hasPurchase: boolean;
  purchaseStatus?: string | null;
};

export function PurchaseRequestButton({
  packageId,
  packageSlug,
  isLoggedIn,
  hasPurchase,
  purchaseStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("request") === "1" && isLoggedIn && !hasPurchase) {
      setOpen(true);
    }
  }, [searchParams, isLoggedIn, hasPurchase]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId, referralCode }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      const message = data.error || "Unable to submit request";
      setError(message);
      toast(message, "error");
      return;
    }

    const message =
      "Purchase request submitted. Our team will contact you for payment.";
    setSuccess(message);
    toast(message, "success");
    setOpen(false);
    router.refresh();
  }

  if (hasPurchase) {
    return (
      <div className="border border-mist/70 bg-white p-5">
        <div className="text-sm tracking-[0.14em] uppercase text-stone">
          Your purchase status
        </div>
        <div className="mt-2 font-display text-2xl capitalize">
          {purchaseStatus}
        </div>
        <p className="mt-2 text-sm text-stone">
          Each member can hold one membership plan purchase. Visit your dashboard for details.
        </p>
        <button
          type="button"
          onClick={() => {
            startNavigation("Opening dashboard…");
            router.push("/dashboard");
          }}
          className="btn-dark mt-4"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {
            startNavigation("Opening login…");
            router.push(
              `/login?next=${encodeURIComponent(`/packages/${packageSlug}?request=1`)}`,
            );
          }}
        >
          Login to Request Purchase
        </button>
        <button
          type="button"
          className="btn-dark w-full"
          onClick={() => {
            startNavigation("Opening signup…");
            router.push(
              `/signup?next=${encodeURIComponent(`/packages/${packageSlug}?request=1`)}`,
            );
          }}
        >
          Create Account
        </button>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button type="button" className="btn-primary w-full" onClick={() => setOpen(true)}>
          Request Purchase
        </button>
      ) : (
        <form onSubmit={onSubmit} className="border border-mist/70 bg-white p-5 space-y-4">
          <div>
            <div className="font-display text-2xl">Confirm purchase request</div>
            <p className="mt-2 text-sm text-stone">
              Payment is collected manually. Admin will approve and activate your membership plan.
            </p>
          </div>
          <input
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="Referral code (optional)"
            className="input-field"
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              className="btn-dark flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {success ? <p className="mt-3 text-sm text-success">{success}</p> : null}
    </div>
  );
}
