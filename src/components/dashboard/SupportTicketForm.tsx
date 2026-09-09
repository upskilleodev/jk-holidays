"use client";

import { FormEvent, useState } from "react";
import { toast } from "@/components/feedback/toast";

export function SupportTicketForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      subject: String(data.get("subject") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    const res = await fetch("/api/member/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    setStatus(res.ok ? "done" : "idle");

    if (!res.ok) {
      toast(json.error || "Could not submit ticket", "error");
      return;
    }

    toast("Ticket submitted. Our team will respond shortly.", "success");
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <input
        name="subject"
        required
        minLength={3}
        maxLength={120}
        placeholder="Subject"
        className="input-field"
      />
      <textarea
        name="message"
        required
        minLength={10}
        maxLength={2000}
        rows={5}
        placeholder="Describe your issue..."
        className="input-field resize-none"
      />
      {status === "done" ? (
        <p className="text-sm text-success">
          Ticket received. We&apos;ll get back to you shortly.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-10 items-center justify-center rounded-md bg-gold-gradient px-5 text-sm font-bold text-navy-deep disabled:opacity-60"
      >
        {status === "loading" ? "Submitting..." : "Submit Ticket"}
      </button>
    </form>
  );
}
