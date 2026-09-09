"use client";

import { Download } from "lucide-react";
import { toast } from "@/components/feedback/toast";

export function ExportCsvButton({
  filename,
  headers,
  rows,
}: {
  filename: string;
  headers: string[];
  rows: string[][];
}) {
  function onExport() {
    if (rows.length === 0) {
      toast("No rows to export", "info");
      return;
    }
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Report exported", "success");
  }

  return (
    <button
      type="button"
      onClick={onExport}
      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-navy hover:bg-muted"
    >
      <Download className="h-4 w-4" />
      Export data
    </button>
  );
}
