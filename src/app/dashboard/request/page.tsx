import { Suspense } from "react";
import { HolidayRequestForm } from "@/components/dashboard/HolidayRequestForm";

export const metadata = { title: "Request Holiday" };

export default function RequestHolidayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Request Holiday
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Book your next getaway in a few simple steps.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
            Loading request form…
          </div>
        }
      >
        <HolidayRequestForm />
      </Suspense>
    </div>
  );
}
