import { connectDB } from "@/lib/db";
import { Purchase } from "@/models/Purchase";

export type MembershipStatus =
  "none" | "pending" | "active" | "rejected" | "cancelled";

/**
 * Membership state for a member. Holiday requests are only open to `active`;
 * everything else means the plan has not been paid for and approved yet.
 */
export async function getMembershipStatus(
  userId: string,
): Promise<MembershipStatus> {
  await connectDB();
  const purchase = await Purchase.findOne({ userId })
    .select("status")
    .lean<{ status?: MembershipStatus }>();

  return purchase?.status || "none";
}

/** Years covered by a plan's free-text validity, e.g. "2 Years", "60 Months". */
export function parseValidityYears(validity?: string | null, fallback = 2) {
  if (!validity) return fallback;
  const years = validity.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  if (years) return Number(years[1]) || fallback;
  const months = validity.match(/(\d+)\s*months?/i);
  if (months) return Number(months[1]) / 12 || fallback;
  return fallback;
}

export type MembershipValidity = {
  isActive: boolean;
  daysLeft: number;
  validTill: string | null;
  progress: number;
};

/**
 * Validity only starts once an admin activates the plan, so a pending or
 * rejected membership has no countdown and no expiry date to show.
 */
export function getMembershipValidity(input: {
  status?: string | null;
  approvedAt?: Date | string | null;
  createdAt?: Date | string | null;
  validity?: string | null;
}): MembershipValidity {
  if (input.status !== "active") {
    return { isActive: false, daysLeft: 0, validTill: null, progress: 0 };
  }

  const start = new Date(input.approvedAt || input.createdAt || Date.now());
  if (Number.isNaN(start.getTime())) {
    return { isActive: true, daysLeft: 0, validTill: null, progress: 0 };
  }

  const end = new Date(start);
  end.setMonth(
    end.getMonth() + Math.round(parseValidityYears(input.validity) * 12),
  );

  const totalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86400000),
  );
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - Date.now()) / 86400000),
  );

  return {
    isActive: true,
    daysLeft,
    validTill: end.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    progress: Math.max(0, Math.min(100, (daysLeft / totalDays) * 100)),
  };
}

export function membershipBlockMessage(status: MembershipStatus) {
  if (status === "pending") {
    return "Your membership payment is still under review. You can raise a holiday request once an admin activates your plan.";
  }
  if (status === "rejected" || status === "cancelled") {
    return "Your membership is not active. Please purchase a plan to raise a holiday request.";
  }
  return "Purchase a membership plan to raise a holiday request.";
}
