"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startNavigation, toast } from "@/components/feedback/toast";
import { FormEvent, useEffect, useState } from "react";
import { PaymentInstructions } from "@/components/packages/PaymentInstructions";

type Props = {
  packageId: string;
  packageSlug: string;
  packageTitle?: string;
  packagePrice?: number;
  isLoggedIn: boolean;
  hasPurchase: boolean;
  purchaseStatus?: string | null;
};

export function PurchaseRequestButton({
  packageId,
  packageSlug,
  packageTitle,
  packagePrice,
  isLoggedIn,
  hasPurchase,
  purchaseStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("request") === "1" && isLoggedIn && !hasPurchase) {
      setOpen(true);
    }
  }, [searchParams, isLoggedIn, hasPurchase]);

  useEffect(() => {
    if (hasPurchase && purchaseStatus === "pending") {
      setShowPayment(true);
    }
  }, [hasPurchase, purchaseStatus]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

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

    toast("Request submitted — complete payment below", "success");
    setOpen(false);
    setShowPayment(true);
    router.refresh();
  }

  if (hasPurchase && purchaseStatus === "pending") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="text-sm font-semibold text-amber-900">
            Purchase pending activation
          </div>
          <p className="mt-1 text-xs text-amber-800/90">
            Pay using the QR or bank details below. Admin will review and
            activate your membership.
          </p>
        </div>
        <PaymentInstructions
          amount={packagePrice}
          planTitle={packageTitle}
          compact
        />
        <button
          type="button"
          onClick={() => {
            startNavigation("Opening membership…");
            router.push("/dashboard/membership");
          }}
          className="btn-dark w-full"
        >
          View in Dashboard
        </button>
      </div>
    );
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
          Each member can hold one membership plan purchase. Visit your
          dashboard for details.
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
    <div className="space-y-4">
      {showPayment ? (
        <PaymentInstructions
          amount={packagePrice}
          planTitle={packageTitle}
          compact
        />
      ) : null}

      {!showPayment && !open ? (
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => setOpen(true)}
        >
          Request Purchase
        </button>
      ) : null}

      {open && !showPayment ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 border border-mist/70 bg-white p-5"
        >
          <div>
            <div className="font-display text-2xl">Confirm purchase request</div>
            <p className="mt-2 text-sm text-stone">
              After you submit, you&apos;ll see QR and bank details to complete
              payment. Admin reviews and activates your plan.
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
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
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
      ) : null}
    </div>
  );
}
