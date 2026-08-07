import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { User } from "@/models/User";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AddAdminButton } from "@/components/admin/AddAdminButton";
import { AdminRoleActions } from "@/components/admin/AdminRoleActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admins & Roles" };

export default async function AdminRolesPage() {
  const session = await getAdminSession();
  await connectDB();
  const admins = await User.find({ role: "admin" })
    .select("-passwordHash")
    .sort({ createdAt: 1 })
    .lean();

  return (
    <div>
      <AdminPageHeader
        title="Admins & Roles"
        description="Create admin logins with email and password."
        action={<AddAdminButton />}
      />

      {admins.length === 0 ? (
        <div className="mobile-card text-sm text-stone">No admins found.</div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => {
            const id = String(admin._id);
            const isSelf = session?.userId === id;

            return (
              <article key={id} className="mobile-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-all font-display text-xl font-bold text-navy">
                        {admin.email}
                      </h2>
                      {isSelf ? (
                        <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                          You
                        </span>
                      ) : null}
                    </div>
                    {admin.name ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {admin.name}
                      </p>
                    ) : null}
                  </div>
                  <span className="status-pill status-active shrink-0">
                    Admin
                  </span>
                </div>

                <div className="mt-4">
                  <AdminRoleActions
                    id={id}
                    name={admin.name}
                    email={admin.email}
                    isSelf={isSelf}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
