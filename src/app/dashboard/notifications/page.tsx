import { redirect } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  Crown,
  Gift,
  Wallet,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { User } from "@/models/User";
import {
  getMemberNotifications,
  type MemberNotification,
} from "@/lib/notifications";
import { MarkNotificationsSeen } from "@/components/dashboard/MarkNotificationsSeen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

const icons = {
  membership: Crown,
  holiday: CalendarCheck,
  reward: Gift,
  withdrawal: Wallet,
} as const;

function timeAgo(at: string) {
  const then = new Date(at).getTime();
  if (!Number.isFinite(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function NotificationsPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard/notifications");

  await connectDB();
  const [user, notifications] = await Promise.all([
    User.findById(session.userId)
      .select("notificationsSeenAt")
      .lean<{ notificationsSeenAt?: Date | null }>(),
    getMemberNotifications(session.userId),
  ]);

  const seen = user?.notificationsSeenAt
    ? new Date(user.notificationsSeenAt).toISOString()
    : null;
  const unread = seen
    ? notifications.filter((n) => n.at > seen).length
    : notifications.length;

  return (
    <div className="space-y-6">
      <MarkNotificationsSeen unread={unread} />
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Updates on your membership, holiday requests, and wallet.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="mobile-card p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
            <Bell className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-navy">
            No notifications yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Updates about your membership, holiday requests, and wallet will
            appear here.
          </p>
        </div>
      ) : (
        <div className="mobile-card p-5">
          {notifications.map((item: MemberNotification) => {
            const Icon = icons[item.kind];
            const isUnread = !seen || item.at > seen;

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 border-b border-border/70 py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-navy">
                      {item.title}
                    </div>
                    {isUnread ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.text}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {timeAgo(item.at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
