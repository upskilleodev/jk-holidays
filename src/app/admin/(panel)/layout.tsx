import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?tab=admin");
  if (session.role !== "admin") redirect("/dashboard");

  return <AdminShell name={session.name}>{children}</AdminShell>;
}
