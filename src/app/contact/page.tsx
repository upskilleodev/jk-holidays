import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { SiteShell } from "@/components/layout/SiteShell";

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
                <MapPin className="mt-1 h-5 w-5 text-gold" />
                <div className="whitespace-pre-line">{site.address}</div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-1 h-5 w-5 text-gold" />
                <div>{site.phone}</div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-1 h-5 w-5 text-gold" />
                <div>{site.email}</div>
              </div>
            </div>
          </div>
          <form className="rounded-xl bg-white p-6 shadow-sm border space-y-3">
            <div>
              <label className="text-sm font-semibold">Name</label>
              <input className="input-field mt-1" name="name" required />
            </div>
            <div>
              <label className="text-sm font-semibold">Mobile</label>
              <input className="input-field mt-1" name="mobile" required />
            </div>
            <div>
              <label className="text-sm font-semibold">Email</label>
              <input
                className="input-field mt-1"
                type="email"
                name="email"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Message</label>
              <textarea
                className="input-field mt-1 min-h-28"
                name="message"
                rows={4}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Book Presentation
            </button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
