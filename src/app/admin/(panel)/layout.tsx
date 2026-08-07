import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Purchase } from "@/models/Purchase";
import { ContactMessage } from "@/models/ContactMessage";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?tab=admin");
  if (session.role !== "admin") redirect("/dashboard");

  await connectDB();
  const [pendingRequests, openTickets] = await Promise.all([
    Purchase.countDocuments({ status: "pending" }),
    ContactMessage.countDocuments(),
  ]);

  return (
    <AdminShell
      name={session.name}
      badges={{
        requests: pendingRequests,
        notifications: Math.min(openTickets, 12) || undefined,
        tickets: Math.min(openTickets, 99) || undefined,
      }}
    >
      {children}
    </AdminShell>
  );
}
