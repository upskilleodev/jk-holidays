import { Bell } from "lucide-react";

export const metadata = { title: "Notifications" };

const notifications = [
  "Your holiday request for Goa has been received.",
  "Referral bonus of ₹2,500 credited to your wallet.",
  "New offer: 40% OFF on International bookings.",
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Updates on bookings, rewards, and member offers.
        </p>
      </div>

      <div className="mobile-card p-5">
        {notifications.map((text) => (
          <div
            key={text}
            className="flex items-start gap-3 border-b border-border/70 py-3 last:border-0 last:pb-0 first:pt-0"
          >
            <Bell className="mt-1 h-4 w-4 shrink-0 text-gold" />
            <div>
              <div className="text-sm text-navy">{text}</div>
              <div className="text-xs text-muted-foreground">Just now</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
