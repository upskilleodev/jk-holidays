import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Resort } from "@/models/Resort";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resorts Directory" };

export default async function ResortsDirectoryPage() {
  await connectDB();
  const dbResorts = await Resort.find({ status: "published" })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const resorts = dbResorts.map((r) => ({
    name: r.name,
    label: r.label,
    image: r.image,
    href: `/dashboard/request?destination=${encodeURIComponent(
      r.name
        .replace(/^Taj\s+/i, "")
        .replace(/\s+Resort$/i, "")
        .trim() || r.name,
    )}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-navy">
          Resorts Directory
        </h1>
        <Link href="/dashboard/request" className="btn-navy">
          Request Holiday
        </Link>
      </div>

      {resorts.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-navy">
            Resort directory coming soon
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Our team is adding partner resorts. Raise a holiday request with
            your preferred destination and we will share the available
            properties.
          </p>
          <Link href="/dashboard/request" className="btn-navy mt-6 inline-flex">
            Request Holiday
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resorts.map((r) => (
            <Link
              key={`${r.name}-${r.label}`}
              href={r.href}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={r.image}
                  alt={r.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="font-display text-lg font-bold text-navy">
                  {r.name}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {r.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
