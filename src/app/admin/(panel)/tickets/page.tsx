import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/ContactMessage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Support Tickets" };

export default async function AdminTicketsPage() {
  await connectDB();
  const messages = await ContactMessage.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div>
      <AdminPageHeader
        title="Support Tickets"
        description="Inbound contact messages treated as support tickets."
      />
      <div className="mobile-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="py-2">Ticket</th>
              <th>Member</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No support tickets yet.
                </td>
              </tr>
            ) : (
              messages.map((m, index) => (
                <tr key={String(m._id)} className="border-b">
                  <td className="py-3 font-mono text-xs">
                    TCK{1000 + index}
                  </td>
                  <td>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="max-w-[220px] truncate">{m.message}</td>
                  <td>
                    <span className="status-pill status-pending">Medium</span>
                  </td>
                  <td>Open</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
