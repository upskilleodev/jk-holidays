"use client";

import { site } from "@/lib/site";
import { Reveal } from "@/components/home/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";

export function ContactSection() {
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
          <div className="mobile-card">
            <ContactForm submitLabel="Send Message" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
