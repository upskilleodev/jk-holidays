"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Copy, MessageCircle, QrCode, Landmark } from "lucide-react";
import { site } from "@/lib/site";
import { cn, formatINR } from "@/lib/utils";
import { toast } from "@/components/feedback/toast";

function whatsappUrl(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

type Props = {
  amount?: number | null;
  planTitle?: string | null;
  className?: string;
  compact?: boolean;
};

export function PaymentInstructions({
  amount,
  planTitle,
  className,
  compact = false,
}: Props) {
  const [tab, setTab] = useState<"scan" | "bank">("scan");
  const [copied, setCopied] = useState<string | null>(null);
  const { payment } = site;

  const waText = [
    `Hi JK Holidays, I have paid for${planTitle ? ` ${planTitle}` : " my membership"}${amount ? ` (${formatINR(amount)})` : ""}.`,
    "Please review and activate my membership.",
  ].join(" ");

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast(`${label} copied`, "success");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast("Could not copy", "error");
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gold/30 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b bg-navy-gradient px-5 py-4 text-white">
        <div className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">
          Complete your payment
        </div>
        <h3 className="mt-1 font-display text-xl font-bold">
          Pay via UPI scan or bank transfer
        </h3>
        <p className="mt-1 text-sm text-white/75">
          Admin will review your payment and activate your membership. Share a
          screenshot on WhatsApp if you need help.
        </p>
        {amount ? (
          <div className="mt-3 inline-flex rounded-lg border border-gold/40 bg-white/5 px-3 py-1.5 text-sm">
            Amount to pay:{" "}
            <span className="ml-1 font-bold text-gold">{formatINR(amount)}</span>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab("scan")}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold",
              tab === "scan"
                ? "border-gold bg-gold-soft/40 text-navy"
                : "border-border text-muted-foreground hover:border-gold/40",
            )}
          >
            <QrCode className="h-4 w-4" />
            Scan to pay
          </button>
          <button
            type="button"
            onClick={() => setTab("bank")}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold",
              tab === "bank"
                ? "border-gold bg-gold-soft/40 text-navy"
                : "border-border text-muted-foreground hover:border-gold/40",
            )}
          >
            <Landmark className="h-4 w-4" />
            Account details
          </button>
        </div>

        {tab === "scan" ? (
          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Open any UPI app and scan this QR to pay JK Holidays.
            </p>
            <div
              className={cn(
                "mx-auto mt-4 overflow-hidden rounded-xl border bg-white p-3",
                compact ? "max-w-[220px]" : "max-w-[280px]",
              )}
            >
              <Image
                src={payment.qrImage}
                alt="JK Holidays payment QR code"
                width={512}
                height={508}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-muted-foreground">
              Transfer to the Axis Bank account below, then wait for admin
              confirmation.
            </p>
            {[
              { label: "Primary Account Holder", value: payment.accountHolder },
              { label: "Account Number", value: payment.accountNumber },
              { label: "IFSC Code", value: payment.ifsc },
              { label: "Bank", value: payment.bankName },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-3"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {row.label}
                  </div>
                  <div className="mt-0.5 break-all font-semibold text-navy">
                    {row.value}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(row.label, row.value)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-bold text-navy hover:bg-white"
                >
                  {copied === row.label ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}

        <a
          href={whatsappUrl(site.phone, waText)}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-bold text-white hover:brightness-95"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp us · {site.phone}
        </a>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          After payment, our team reviews and activates your plan. Message us on
          WhatsApp with your payment screenshot for faster confirmation.
        </p>
      </div>
    </div>
  );
}
