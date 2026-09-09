import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Resort } from "@/models/Resort";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ViewResortPage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const resort = await Resort.findById(id).lean();
  if (!resort) notFound();

  const photos =
    resort.photos && resort.photos.length > 0
      ? resort.photos
      : [resort.image];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/resorts"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to resorts
      </Link>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="relative h-64 sm:h-80">
          <Image
            src={resort.image}
            alt={resort.name}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized={resort.image.startsWith("http")}
            priority
          />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-navy">
                {resort.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{resort.label}</p>
            </div>
            <Link
              href={`/admin/resorts/${resort._id}/edit`}
              className="inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-semibold text-white"
            >
              Edit property
            </Link>
          </div>
          {resort.description ? (
            <p className="mt-4 text-sm leading-relaxed text-navy/80">
              {resort.description}
            </p>
          ) : null}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((src: string) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized={src.startsWith("http")}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
