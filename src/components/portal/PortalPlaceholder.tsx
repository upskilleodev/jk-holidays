import Link from "next/link";
import { Construction } from "lucide-react";

export function PortalPlaceholder({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm md:p-10">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
        <Construction className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-navy">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-navy mt-6 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
