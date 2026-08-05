import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Package } from "@/models/Package";
import { PackageForm } from "@/components/admin/PackageForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPackagePage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const pkg = await Package.findById(id).lean();
  if (!pkg) notFound();

  return (
    <div>
      <div className="eyebrow !text-stone">Edit</div>
      <h1 className="mt-2 page-title">{pkg.title}</h1>
      <div className="mt-6">
        <PackageForm
          initial={{
            _id: String(pkg._id),
            title: pkg.title,
            summary: pkg.summary,
            description: pkg.description,
            price: pkg.price,
            originalPrice: pkg.originalPrice,
            duration: pkg.duration,
            validity: pkg.validity,
            destination: pkg.destination,
            inclusions: pkg.inclusions || [],
            highlights: pkg.highlights || [],
            coverImage: pkg.coverImage,
            images: pkg.images || [],
            badge: pkg.badge,
            isFeatured: pkg.isFeatured,
            status: pkg.status as "draft" | "published",
            sortOrder: pkg.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
