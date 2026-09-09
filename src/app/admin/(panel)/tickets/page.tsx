import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/ContactMessage";
import {
  AdminTicketsPanel,
  type AdminTicketRow,
} from "@/components/admin/AdminTicketsPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Support Tickets" };

export default async function AdminTicketsPage() {
  await connectDB();
  const messages = await ContactMessage.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  // Backfill ticket IDs for older rows
  const needsId = messages.filter((m) => !m.ticketId);
  if (needsId.length > 0) {
    const total = await ContactMessage.countDocuments();
    await Promise.all(
      needsId.map((m, i) =>
        ContactMessage.updateOne(
          { _id: m._id },
          {
            $set: {
              ticketId: `TCK${1000 + total - needsId.length + i + 1}`,
              priority: m.priority || "medium",
              ticketStatus: m.ticketStatus || "open",
              subject: m.subject || (m.message || "").slice(0, 60),
            },
          },
        ),
      ),
    );
  }

  const fresh = needsId.length
    ? await ContactMessage.find().sort({ createdAt: -1 }).limit(100).lean()
    : messages;

  const tickets: AdminTicketRow[] = fresh.map((m) => ({
    id: String(m._id),
    ticketId: m.ticketId || `TCK${String(m._id).slice(-4).toUpperCase()}`,
    memberName: m.name,
    memberEmail: m.email,
    subject: m.subject || "General enquiry",
    message: m.message,
    priority: (m.priority as AdminTicketRow["priority"]) || "medium",
    ticketStatus:
      (m.ticketStatus as AdminTicketRow["ticketStatus"]) || "open",
  }));

  return <AdminTicketsPanel tickets={tickets} />;
}
