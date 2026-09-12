import Link from "next/link";
import { Headphones, Phone } from "lucide-react";
import { getSiteContact } from "@/lib/site-settings";
import { SupportTicketForm } from "@/components/dashboard/SupportTicketForm";

export const metadata = { title: "Travel Support" };

export default async function SupportPage() {
  const contact = await getSiteContact();
  const telHref = `tel:${contact.phone.replace(/\s+/g, "")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            Travel Support
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Raise a ticket or reach our concierge team anytime.
          </p>
        </div>
        <a
          href={telHref}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gold-gradient px-4 text-sm font-bold text-navy-deep"
        >
          <Phone className="h-4 w-4" />
          Contact Support
        </a>
      </div>

      <div className="mobile-card p-6">
        <div className="flex items-center gap-3">
          <Headphones className="h-8 w-8 shrink-0 text-gold" />
          <div>
            <div className="font-semibold text-navy">24/7 Member Support</div>
            <div className="text-sm text-muted-foreground">
              Call{" "}
              <a href={telHref} className="font-medium text-navy underline-offset-2 hover:underline">
                {contact.phone}
              </a>{" "}
              or submit a ticket
            </div>
          </div>
        </div>

        <SupportTicketForm />

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border/60 pt-5">
          <a
            href={telHref}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-navy/15 bg-white px-4 text-sm font-semibold text-navy"
          >
            <Phone className="h-4 w-4 text-gold" />
            Call {contact.phone}
          </a>
          <Link
            href="/contact"
            className="inline-flex h-9 items-center rounded-md border border-navy/15 bg-white px-4 text-sm font-semibold text-navy"
          >
            Public contact form
          </Link>
        </div>
      </div>
    </div>
  );
}
