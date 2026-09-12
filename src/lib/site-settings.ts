import { cache } from "react";
import { connectDB } from "@/lib/db";
import { SiteSetting } from "@/models/SiteSetting";
import { site } from "@/lib/site";

export type SiteContact = {
  email: string;
  phone: string;
};

export const defaultContact: SiteContact = {
  email: site.email,
  phone: site.phone,
};

/**
 * Brand contact details shown across the site. Server-only.
 *
 * Falls back to the values in `site.ts` when nothing is saved yet, and when the
 * database is unreachable — a marketing page should still render its header.
 * Cached per request so the shells can call it without extra queries.
 */
export const getSiteContact = cache(async (): Promise<SiteContact> => {
  try {
    await connectDB();
    const setting = await SiteSetting.findOne({ key: "site" }).lean<{
      email?: string;
      phone?: string;
    }>();

    return {
      email: setting?.email || defaultContact.email,
      phone: setting?.phone || defaultContact.phone,
    };
  } catch (error) {
    console.error("Could not load site contact settings", error);
    return defaultContact;
  }
});
