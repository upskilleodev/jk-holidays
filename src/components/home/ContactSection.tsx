"use client";

import { FormEvent, useState } from "react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/home/Reveal";

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
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
      setError(data.error || "Unable to send message");
      setStatus("error");
      return;
    }

    setStatus("done");
    event.currentTarget.reset();
  }

  return (
    <section id="contact" className="bg-cream py-8 sm:py-10">
      <div className="container-luxury grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <div className="eyebrow">Contact</div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl leading-tight">
            Tell us where you want to go
          </h2>
          <p className="mt-2 text-sm text-stone leading-snug max-w-md">
            Membership guidance, destinations, or partnerships — we&apos;re here.
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <div>{site.email}</div>
            <div>{site.phone}</div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <form onSubmit={onSubmit} className="mobile-card space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                required
                placeholder="Full name"
                className="input-field"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="input-field"
              />
            </div>
            <input
              name="phone"
              placeholder="Phone (optional)"
              className="input-field"
            />
            <textarea
              name="message"
              required
              rows={3}
              placeholder="How can we help?"
              className="input-field resize-none"
            />
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            {status === "done" ? (
              <p className="text-sm text-success">
                Message received. Our team will get back to you shortly.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-dark w-full"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
