import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Bookings" };

export default function AdminBookingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Bookings"
        description="Confirmed member holiday bookings will appear here."
      />
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">
          No bookings yet. Approved holiday requests will show up in this module.
        </p>
      </div>
    </div>
  );
}
