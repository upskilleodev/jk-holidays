import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Resort } from "@/models/Resort";
import { ResortForm } from "@/components/admin/ResortForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditResortPage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const resort = await Resort.findById(id).lean();
  if (!resort) notFound();

  return (
    <div>
      <div className="eyebrow !text-stone">Edit</div>
      <h1 className="mt-2 page-title">{resort.name}</h1>
      <div className="mt-6">
        <ResortForm
          initial={{
            _id: String(resort._id),
            name: resort.name,
            label: resort.label,
            image: resort.image,
            status: resort.status as "draft" | "published",
            sortOrder: resort.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
