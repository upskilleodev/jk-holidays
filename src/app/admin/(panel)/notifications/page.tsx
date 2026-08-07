import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/ContactMessage";
import { Purchase } from "@/models/Purchase";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  await connectDB();
  const [messages, pending] = await Promise.all([
    ContactMessage.find().sort({ createdAt: -1 }).limit(15).lean(),
    Purchase.countDocuments({ status: "pending" }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Notifications"
        description="Operational alerts from contact forms and pending requests."
      />
      {pending > 0 ? (
        <Link
          href="/admin/purchases"
          className="mb-4 block rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {pending} holiday request{pending === 1 ? "" : "s"} awaiting approval
        </Link>
      ) : null}
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="mobile-card text-sm text-muted-foreground">
            No contact notifications yet.
          </div>
        ) : (
          messages.map((m) => (
            <div key={String(m._id)} className="mobile-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-navy">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              <p className="mt-2 text-sm text-stone">{m.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
