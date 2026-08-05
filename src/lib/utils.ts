export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateReferralCode(name: string) {
  const cleaned = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "JKHL";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${cleaned}${suffix}`;
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
