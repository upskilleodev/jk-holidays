import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await connectDB();
  const users = await User.find({ role: "user" })
    .select("-passwordHash")
    .sort({ createdAt: -1 });
  const purchases = await Purchase.find().select("userId status");
  const map = new Map(purchases.map((p) => [String(p.userId), p.status]));

  return (
    <div>
      <div className="eyebrow !text-stone">Members</div>
      <h1 className="mt-2 page-title">Registered users</h1>
      <p className="mt-3 text-sm text-stone">
        {users.length} member{users.length === 1 ? "" : "s"} total
      </p>

      <div className="mt-6 space-y-3">
        {users.length === 0 ? (
          <div className="mobile-card text-sm text-stone">No users yet.</div>
        ) : (
          users.map((user) => {
            const purchaseStatus = map.get(String(user._id));
            return (
              <article key={String(user._id)} className="mobile-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-medium truncate">{user.name}</h2>
                    <p className="mt-0.5 text-xs text-stone break-all">
                      {user.email}
                    </p>
                  </div>
                  {purchaseStatus ? (
                    <span className={`status-pill status-${purchaseStatus} shrink-0`}>
                      {purchaseStatus}
                    </span>
                  ) : (
                    <span className="text-xs text-stone shrink-0">No purchase</span>
                  )}
                </div>
                <div className="mt-4 rounded-none border border-gold/30 bg-cream px-3 py-2">
                  <div className="text-[10px] tracking-[0.14em] uppercase text-stone">
                    Referral code
                  </div>
                  <div className="mt-1 font-display text-xl tracking-[0.16em]">
                    {user.referralCode}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
