import Link from "next/link";
import { FileBarChart2 } from "lucide-react";
import { REPORT_TYPES } from "@/lib/admin-reports";

export const metadata = { title: "Reports" };

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a category to view live data and export CSV.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REPORT_TYPES.map((r) => (
          <article
            key={r.slug}
            className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft text-navy">
                <FileBarChart2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-navy">
                  {r.title}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/admin/reports/${r.slug}`}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                View data →
              </Link>
              <Link
                href={`/admin/reports/${r.slug}?export=1`}
                className="text-sm font-semibold text-navy hover:underline"
              >
                Open & export
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
