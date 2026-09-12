"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { toast } from "@/components/feedback/toast";

export function SiteContactForm({
  initial,
}: {
  initial: { email: string; phone: string };
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [loading, setLoading] = useState(false);

  const dirty = email !== initial.email || phone !== initial.phone;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Could not save contact details", "error");
      return;
    }

    toast("Contact details updated", "success");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mobile-card mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-navy">
            Brand contact details
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown across the website, member portal, and WhatsApp links.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-navy">
            <Phone className="h-3.5 w-3.5 text-gold" />
            Mobile number
          </span>
          <input
            className="input-field mt-1.5"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 90123 45678"
            inputMode="tel"
          />
        </label>
        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-navy">
            <Mail className="h-3.5 w-3.5 text-gold" />
            Email ID
          </span>
          <input
            className="input-field mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@jkholidays.com"
            inputMode="email"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !dirty}
        className="btn-navy mt-4 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
