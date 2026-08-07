import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Admins & Roles" };

const admins = [
  {
    name: "JK Admin",
    email: "admin@jkholidays.com",
    role: "Super Admin",
    status: "Active",
  },
  {
    name: "Ops Manager",
    email: "ops@jkholidays.com",
    role: "Operations",
    status: "Invite pending",
  },
];

export default function AdminRolesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Admins & Roles"
        description="Team access control. Multi-admin invites coming next."
        action={
          <button type="button" className="btn-navy" disabled>
            + Add Admin
          </button>
        }
      />
      <div className="mobile-card overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.email} className="border-b">
                <td className="py-3 font-medium">{a.name}</td>
                <td>{a.email}</td>
                <td>{a.role}</td>
                <td>
                  <span
                    className={`status-pill ${
                      a.status === "Active" ? "status-active" : "status-pending"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
