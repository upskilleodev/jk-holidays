"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { site } from "@/lib/site";
import { toast } from "@/components/feedback/toast";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

function buildShareText(code: string, origin: string) {
  const joinUrl = `${origin}/signup?referral=${encodeURIComponent(code)}`;
  return `Join ${site.name} with my referral code ${code} and unlock premium holiday memberships. ${site.tagline}\n\nSign up: ${joinUrl}`;
}

export function CopyReferralButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const shareText = useMemo(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return buildShareText(code, origin);
  }, [code]);

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast(successMessage, "success");
      window.setTimeout(() => setCopied(false), 1800);
      return true;
    } catch {
      toast("Could not copy. Please copy manually.", "error");
      return false;
    }
  }

  async function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast("Opening WhatsApp…", "info");
  }

  async function shareInstagram() {
    const ok = await copyText(
      shareText,
      "Message copied — paste it in Instagram DM or Story",
    );
    if (!ok) return;
    // Instagram has no web share intent for custom text; open app/site after copy.
    window.setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    }, 250);
  }

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        onClick={() => copyText(code, "Referral code copied")}
        className="btn-primary w-full"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" /> Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" /> Copy referral code
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={shareWhatsApp}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-white",
            "bg-[#25D366] hover:bg-[#1ebe57]",
          )}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={shareInstagram}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-white",
            "bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:opacity-90",
          )}
        >
          <InstagramIcon className="h-4 w-4" />
          Instagram
        </button>
      </div>
    </div>
  );
}
