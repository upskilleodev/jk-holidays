export const REPORT_TYPES = [
  {
    slug: "membership",
    title: "Membership Report",
    description: "Members, plans, and account status",
  },
  {
    slug: "bookings",
    title: "Bookings Report",
    description: "Scheduled bookings and calendar status",
  },
  {
    slug: "financial",
    title: "Financial Report",
    description: "Plan purchases, amounts, and payment status",
  },
  {
    slug: "referral",
    title: "Referral Report",
    description: "Referral points and cashback rewards",
  },
  {
    slug: "support",
    title: "Support Report",
    description: "Support tickets and member messages",
  },
  {
    slug: "activity",
    title: "Activity Report",
    description: "Recent admin and member activity",
  },
] as const;

export type ReportSlug = (typeof REPORT_TYPES)[number]["slug"];

export function isReportSlug(value: string): value is ReportSlug {
  return REPORT_TYPES.some((r) => r.slug === value);
}
