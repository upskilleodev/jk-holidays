import { connectDB } from "@/lib/db";
import { destinations } from "@/lib/site";
import { Resort } from "@/models/Resort";

export type ResortCard = {
  _id?: string;
  name: string;
  label: string;
  image: string;
  slug?: string;
};

export async function getPublishedResorts(): Promise<ResortCard[]> {
  try {
    await connectDB();
    const resorts = await Resort.find({ status: "published" })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    if (resorts.length > 0) {
      return resorts.map((r) => ({
        _id: String(r._id),
        name: r.name,
        label: r.label,
        image: r.image,
        slug: r.slug,
      }));
    }
  } catch {
    // Fall through to static destinations if DB is unavailable.
  }

  return destinations.map((d) => ({
    name: d.name,
    label: d.label,
    image: d.image,
  }));
}
