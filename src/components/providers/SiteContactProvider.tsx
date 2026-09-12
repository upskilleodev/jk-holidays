"use client";

import { createContext, useContext } from "react";
import { site } from "@/lib/site";

export type SiteContact = {
  email: string;
  phone: string;
};

const SiteContactContext = createContext<SiteContact>({
  email: site.email,
  phone: site.phone,
});

export function SiteContactProvider({
  contact,
  children,
}: {
  contact: SiteContact;
  children: React.ReactNode;
}) {
  return (
    <SiteContactContext.Provider value={contact}>
      {children}
    </SiteContactContext.Provider>
  );
}

/** Live brand contact details; falls back to `site.ts` outside a provider. */
export function useSiteContact() {
  return useContext(SiteContactContext);
}

/** Digits only, for `wa.me` and `tel:` links. */
export function contactDigits(phone: string) {
  return phone.replace(/\D/g, "");
}
