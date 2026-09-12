import { connectDB } from "@/lib/db";
import { Purchase } from "@/models/Purchase";
import { HolidayRequest } from "@/models/HolidayRequest";
import { CashbackReward } from "@/models/CashbackReward";
import { Withdrawal } from "@/models/Withdrawal";
import { formatINR } from "@/lib/utils";

export type MemberNotification = {
  id: string;
  kind: "membership" | "holiday" | "reward" | "withdrawal";
  title: string;
  text: string;
  at: string;
};

function iso(value: unknown, fallback: unknown) {
  const date = new Date((value || fallback) as string);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

/**
 * The member's activity feed, derived from their own records. There is no
 * separate notification collection — everything shown here is a real event on
 * the member's account, so a new member correctly sees nothing.
 */
export async function getMemberNotifications(
  userId: string,
): Promise<MemberNotification[]> {
  await connectDB();

  const [purchase, requests, rewards, withdrawals] = await Promise.all([
    Purchase.findOne({ userId })
      .populate("packageId", "title")
      .lean<{
        _id: { toString(): string };
        status: string;
        approvedAt?: Date | null;
        createdAt?: Date;
        updatedAt?: Date;
        adminNote?: string;
        packageId?: { title?: string } | null;
      }>(),
    HolidayRequest.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean<
        Array<{
          _id: { toString(): string };
          requestId: string;
          destination: string;
          status: string;
          adminNote?: string;
          altDates?: string;
          createdAt?: Date;
          updatedAt?: Date;
        }>
      >(),
    CashbackReward.find({ referrerUserId: userId })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean<
        Array<{
          _id: { toString(): string };
          amount: number;
          status: string;
          source: string;
          note?: string;
          createdAt?: Date;
          updatedAt?: Date;
        }>
      >(),
    Withdrawal.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean<
        Array<{
          _id: { toString(): string };
          amount: number;
          status: string;
          adminNote?: string;
          createdAt?: Date;
          updatedAt?: Date;
        }>
      >(),
  ]);

  const items: MemberNotification[] = [];

  if (purchase) {
    const planTitle = purchase.packageId?.title || "membership plan";
    if (purchase.status === "active") {
      items.push({
        id: `purchase-${purchase._id.toString()}-active`,
        kind: "membership",
        title: "Membership activated",
        text: `Your ${planTitle} is now active. You can start requesting holidays.`,
        at: iso(purchase.approvedAt, purchase.updatedAt),
      });
    } else if (purchase.status === "pending") {
      items.push({
        id: `purchase-${purchase._id.toString()}-pending`,
        kind: "membership",
        title: "Membership payment under review",
        text: `We have received your request for ${planTitle}. Our team will activate it once the payment is confirmed.`,
        at: iso(purchase.createdAt, purchase.updatedAt),
      });
    } else if (purchase.status === "rejected" || purchase.status === "cancelled") {
      items.push({
        id: `purchase-${purchase._id.toString()}-${purchase.status}`,
        kind: "membership",
        title: `Membership ${purchase.status}`,
        text:
          purchase.adminNote ||
          "Please contact support for help with your membership.",
        at: iso(purchase.updatedAt, purchase.createdAt),
      });
    }
  }

  for (const r of requests) {
    const base = `${r.requestId} · ${r.destination}`;
    if (r.status === "approved") {
      items.push({
        id: `request-${r._id.toString()}-approved`,
        kind: "holiday",
        title: "Holiday request confirmed",
        text: `${base} has been confirmed.${r.altDates ? ` Suggested dates: ${r.altDates}.` : ""}`,
        at: iso(r.updatedAt, r.createdAt),
      });
    } else if (r.status === "rejected") {
      items.push({
        id: `request-${r._id.toString()}-rejected`,
        kind: "holiday",
        title: "Holiday request declined",
        text: `${base} could not be confirmed.${r.adminNote ? ` ${r.adminNote}` : ""}`,
        at: iso(r.updatedAt, r.createdAt),
      });
    } else if (r.status === "completed") {
      items.push({
        id: `request-${r._id.toString()}-completed`,
        kind: "holiday",
        title: "Holiday completed",
        text: `${base} is marked as completed. We hope you had a great trip.`,
        at: iso(r.updatedAt, r.createdAt),
      });
    } else {
      items.push({
        id: `request-${r._id.toString()}-pending`,
        kind: "holiday",
        title: "Holiday request received",
        text: `${base} is awaiting confirmation from our team.`,
        at: iso(r.createdAt, r.updatedAt),
      });
    }
  }

  for (const reward of rewards) {
    const amount = formatINR(reward.amount);
    const isCredited = reward.status === "approved" || reward.status === "paid";
    items.push({
      id: `reward-${reward._id.toString()}`,
      kind: "reward",
      title: isCredited ? "Referral cashback credited" : "Referral cashback pending",
      text: isCredited
        ? `${amount} has been added to your wallet.`
        : `${amount} referral cashback is being processed.`,
      at: iso(reward.updatedAt, reward.createdAt),
    });
  }

  for (const w of withdrawals) {
    const amount = formatINR(w.amount);
    const copy: Record<string, { title: string; text: string }> = {
      paid: { title: "Withdrawal paid", text: `${amount} has been transferred to your account.` },
      approved: { title: "Withdrawal approved", text: `${amount} is approved and will be transferred shortly.` },
      rejected: {
        title: "Withdrawal rejected",
        text: `${amount} withdrawal was rejected.${w.adminNote ? ` ${w.adminNote}` : ""}`,
      },
      pending: { title: "Withdrawal requested", text: `${amount} withdrawal request is under review.` },
    };
    const entry = copy[w.status] || copy.pending;
    items.push({
      id: `withdrawal-${w._id.toString()}`,
      kind: "withdrawal",
      title: entry.title,
      text: entry.text,
      at: iso(w.updatedAt, w.createdAt),
    });
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 30);
}

/** Count of feed items the member has not opened yet. */
export async function getMemberNotificationCount(
  userId: string,
  seenAt?: Date | null,
) {
  const items = await getMemberNotifications(userId);
  if (!seenAt) return items.length;
  const seen = new Date(seenAt).toISOString();
  return items.filter((item) => item.at > seen).length;
}
