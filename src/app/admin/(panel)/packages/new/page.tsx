import { PackageForm } from "@/components/admin/PackageForm";

export default function NewPackagePage() {
  return (
    <div>
      <div className="eyebrow !text-stone">Create</div>
      <h1 className="mt-2 page-title">New membership plan</h1>
      <div className="mt-6">
        <PackageForm />
      </div>
    </div>
  );
}
