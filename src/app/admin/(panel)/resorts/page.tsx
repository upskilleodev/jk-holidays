import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import { destinations } from "@/lib/site";
import { slugifyTitle } from "@/lib/utils";
import { Resort } from "@/models/Resort";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resorts" };

export default async function AdminResortsPage() {
  await connectDB();
  let resorts = await Resort.find().sort({ sortOrder: 1, createdAt: -1 });

  // Seed starter properties once so the grid matches the design
  if (resorts.length === 0) {
    await Resort.insertMany(
      destinations.map((d, i) => ({
        name: `Taj ${d.name} Resort`,
        label: d.label,
        image: d.image,
        photos: [d.image],
        description: `Premium member stay in ${d.name}.`,
        slug: slugifyTitle(`taj-${d.name}-resort`),
        status: "published",
        sortOrder: i,
      })),
    );
    resorts = await Resort.find().sort({ sortOrder: 1, createdAt: -1 });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Resorts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dashboard › Resorts
          </p>
        </div>
        <Link
          href="/admin/resorts/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-soft"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {resorts.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-display text-xl font-bold text-navy">
            No properties yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a property with photos to show it in the member directory.
          </p>
          <Link
            href="/admin/resorts/new"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-navy px-4 text-sm font-semibold text-white"
          >
            + Add Property
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resorts.map((resort) => (
            <article
              key={String(resort._id)}
              className="overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
            >
              <div className="relative h-44">
                <Image
                  src={resort.image}
                  alt={resort.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                  unoptimized={resort.image.startsWith("http")}
                />
                <span
                  className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    resort.status === "published"
                      ? "bg-emerald-500 text-white"
                      : "bg-white/90 text-navy"
                  }`}
                >
                  {resort.status}
                </span>
              </div>
              <div className="p-4">
                <div className="font-display text-lg font-bold text-navy">
                  {resort.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {resort.label}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/resorts/${resort._id}/edit`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-navy/15 text-sm font-semibold text-navy hover:bg-muted"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/resorts/${resort._id}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-navy/15 text-sm font-semibold text-navy hover:bg-muted"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
