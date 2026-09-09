import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { destinations } from "@/lib/site";
import { Resort } from "@/models/Resort";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resorts Directory" };

export default async function ResortsDirectoryPage() {
  await connectDB();
  const dbResorts = await Resort.find({ status: "published" })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const resorts =
    dbResorts.length > 0
      ? dbResorts.map((r) => ({
          name: r.name,
          label: r.label,
          image: r.image,
          href: `/dashboard/request?destination=${encodeURIComponent(
            r.name.replace(/^Taj\s+/i, "").replace(/\s+Resort$/i, "").trim() ||
              r.name,
          )}`,
        }))
      : destinations.map((d) => ({
          name: `Taj ${d.name} Resort`,
          label: d.label,
          image: d.image,
          href: `/dashboard/request?destination=${encodeURIComponent(d.name)}`,
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
    </div>
  );
}
