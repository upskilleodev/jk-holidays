import { ResortForm } from "@/components/admin/ResortForm";

export const metadata = { title: "Add Property" };

export default function NewResortPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-navy">Add Property</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload photos and publish a resort for members.
      </p>
      <div className="mt-6">
        <ResortForm />
      </div>
    </div>
  );
}
