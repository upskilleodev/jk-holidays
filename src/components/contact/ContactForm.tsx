"use client";

import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/feedback/toast";

type Props = {
  className?: string;
  submitLabel?: string;
};

export function ContactForm({
  className,
  submitLabel = "Book Presentation",
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      message: String(form.get("message") || ""),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data.error || "Unable to send message";
      setError(message);
      setStatus("error");
      toast(message, "error");
      return;
    }

    setStatus("done");
    toast("Message sent. We'll get back to you shortly.", "success");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-3", className)}>
      <div>
        <label className="text-sm font-semibold text-navy">Name</label>
        <input
          className="input-field mt-1"
          name="name"
          required
          minLength={2}
          placeholder="Full name"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-navy">Mobile</label>
        <input
          className="input-field mt-1"
          name="phone"
          required
          placeholder="Phone number"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-navy">Email</label>
        <input
          className="input-field mt-1"
          type="email"
          name="email"
          required
          placeholder="Email"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-navy">Message</label>
        <textarea
          className="input-field mt-1 min-h-28 resize-none"
          name="message"
          required
          minLength={5}
          rows={4}
          placeholder="Tell us when you're free for a presentation"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {status === "done" ? (
        <p className="text-sm text-success">
          Message received. Our team will get back to you shortly.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full"
      >
        {status === "loading" ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}
