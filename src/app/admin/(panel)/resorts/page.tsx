import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Resort } from "@/models/Resort";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteResortButton } from "@/components/admin/DeleteResortButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resorts" };

export default async function AdminResortsPage() {
  await connectDB();
  const resorts = await Resort.find().sort({ sortOrder: 1, createdAt: -1 });

  return (
    <div>
      <AdminPageHeader
        title="Resorts"
        description="Partner properties shown across membership destinations."
        action={
          <Link href="/admin/resorts/new" className="btn-navy">
            + Add Resort
          </Link>
        }
      />

      {resorts.length === 0 ? (
        <div className="mobile-card text-sm text-stone">
          No resorts yet.{" "}
          <Link href="/admin/resorts/new" className="font-semibold text-navy underline">
            Add your first resort
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resorts.map((resort) => (
            <article
              key={String(resort._id)}
              className="overflow-hidden rounded-xl border bg-white"
            >
              <div className="relative h-40">
                <Image
                  src={resort.image}
                  alt={resort.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                  unoptimized={resort.image.startsWith("http")}
                />
                <span
                  className={`status-pill absolute right-3 top-3 ${
                    resort.status === "published"
                      ? "status-active"
                      : "status-pending"
                  }`}
                >
                  {resort.status}
                </span>
              </div>
              <div className="p-4">
                <div className="font-display text-lg font-bold text-navy">
                  {resort.name}
                </div>
                <div className="text-xs text-muted-foreground">{resort.label}</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/resorts/${resort._id}/edit`}
                    className="btn-ghost !h-9 !border-border !text-navy"
                  >
                    Edit
                  </Link>
                  <DeleteResortButton
                    id={String(resort._id)}
                    name={resort.name}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
