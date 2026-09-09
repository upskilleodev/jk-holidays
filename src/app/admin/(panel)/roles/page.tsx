import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { User } from "@/models/User";
import { AddAdminButton } from "@/components/admin/AddAdminButton";
import {
  AdminRoleActions,
  type AdminRoleValue,
} from "@/components/admin/AdminRoleActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admins & Roles" };

function roleLabel(role?: string | null) {
  if (role === "support") return "Support";
  if (role === "operations") return "Manager";
  return "Super Admin";
}

export default async function AdminRolesPage() {
  const session = await getAdminSession();
  await connectDB();
  const admins = await User.find({ role: "admin" })
    .select("-passwordHash")
    .sort({ createdAt: 1 })
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            Admins & Roles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dashboard › Admins & Roles
          </p>
        </div>
        <AddAdminButton />
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {admins.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No admins found.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Admin</th>
                    <th className="pr-3">Email</th>
                    <th className="pr-3">Role</th>
                    <th className="pr-3">Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => {
                    const id = String(admin._id);
                    const isSelf = session?.userId === id;
                    const role = (admin.adminRole ||
                      "super_admin") as AdminRoleValue;
                    const status =
                      admin.adminStatus === "invite_pending"
                        ? "invite_pending"
                        : "active";

                    return (
                      <tr key={id} className="border-b last:border-0">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy">
                              {admin.name || "Admin"}
                            </span>
                            {isSelf ? (
                              <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-navy uppercase">
                                You
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="pr-3 break-all">{admin.email}</td>
                        <td className="pr-3">
                          <span className="inline-flex rounded-full bg-navy px-2.5 py-0.5 text-xs font-semibold text-white">
                            {roleLabel(role)}
                          </span>
                        </td>
                        <td className="pr-3">
                          {status === "active" ? (
                            <span className="text-emerald-600">● Active</span>
                          ) : (
                            <span className="text-amber-600">
                              ● Invite pending
                            </span>
                          )}
                        </td>
                        <td>
                          <AdminRoleActions
                            id={id}
                            name={admin.name || ""}
                            email={admin.email}
                            adminRole={role}
                            adminStatus={status}
                            isSelf={isSelf}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {admins.map((admin) => {
                const id = String(admin._id);
                const isSelf = session?.userId === id;
                const role = (admin.adminRole ||
                  "super_admin") as AdminRoleValue;
                const status =
                  admin.adminStatus === "invite_pending"
                    ? "invite_pending"
                    : "active";

                return (
                  <article
                    key={id}
                    className="rounded-xl border border-border/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-navy">
                          {admin.name || "Admin"}
                          {isSelf ? " (You)" : ""}
                        </div>
                        <div className="break-all text-xs text-muted-foreground">
                          {admin.email}
                        </div>
                      </div>
                      <span className="inline-flex rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        {roleLabel(role)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {status === "active" ? (
                        <span className="text-sm text-emerald-600">
                          ● Active
                        </span>
                      ) : (
                        <span className="text-sm text-amber-600">
                          ● Invite pending
                        </span>
                      )}
                      <AdminRoleActions
                        id={id}
                        name={admin.name || ""}
                        email={admin.email}
                        adminRole={role}
                        adminStatus={status}
                        isSelf={isSelf}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
