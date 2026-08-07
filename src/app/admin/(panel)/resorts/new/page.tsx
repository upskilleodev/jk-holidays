import { ResortForm } from "@/components/admin/ResortForm";

export const metadata = { title: "New Resort" };

export default function NewResortPage() {
  return (
    <div>
      <div className="eyebrow !text-stone">Create</div>
      <h1 className="mt-2 page-title">New resort</h1>
      <div className="mt-6">
        <ResortForm />
      </div>
    </div>
  );
}
