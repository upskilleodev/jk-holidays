import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sans = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function getAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

const appUrl = getAppUrl();
const ogImageUrl = `${appUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "JK Holidays",
    "holiday membership",
    "luxury travel",
    "holiday packages India",
    "resort membership",
  ],
  authors: [{ name: site.name }],
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: appUrl,
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [ogImageUrl],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#0d1424",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh overflow-x-clip antialiased bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
