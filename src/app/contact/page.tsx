import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { SiteShell } from "@/components/layout/SiteShell";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with JK Holidays. Book a free presentation today.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <section id="contact" className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-navy">
          Book Free Presentation
        </h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">
              Get in Touch
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div className="whitespace-pre-line">{site.address}</div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div>{site.phone}</div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div>{site.email}</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
