import Image from "next/image";
import { destinations } from "@/lib/site";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Resorts" };

export default function AdminResortsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Resorts"
        description="Partner properties shown across membership destinations."
        action={
          <button type="button" className="btn-navy" disabled>
            + Add Resort
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <div key={d.name} className="overflow-hidden rounded-xl border bg-white">
            <div className="relative h-40">
              <Image
                src={d.image}
                alt={d.name}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </div>
            <div className="p-4">
              <div className="font-display text-lg font-bold text-navy">
                {d.name} Resort
              </div>
              <div className="text-xs text-muted-foreground">{d.label}</div>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-ghost !text-navy !border-border flex-1 !h-9">
                  Edit
                </button>
                <button type="button" className="btn-ghost !text-navy !border-border flex-1 !h-9">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
