"use client";

import { FormEvent, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type PackageFormValues = {
  _id?: string;
  title: string;
  summary: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  duration: string;
  validity?: string;
  destination: string;
  inclusions: string[];
  highlights: string[];
  coverImage: string;
  images: string[];
  badge?: string;
  isFeatured?: boolean;
  status: "draft" | "published";
  sortOrder?: number;
};

const empty: PackageFormValues = {
  title: "",
  summary: "",
  description: "",
  price: 0,
  originalPrice: null,
  duration: "",
  validity: "",
  destination: "",
  inclusions: [],
  highlights: [],
  coverImage: "",
  images: [],
  badge: "",
  isFeatured: false,
  status: "draft",
  sortOrder: 0,
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-stone">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-[11px] text-stone/80">{hint}</span> : null}
    </label>
  );
}

export function PackageForm({ initial }: { initial?: PackageFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<PackageFormValues>(initial || empty);
  const [inclusionsText, setInclusionsText] = useState(
    (initial?.inclusions || []).join("\n")
  );
  const [imagesText, setImagesText] = useState((initial?.images || []).join("\n"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...values,
      price: Number(values.price),
      originalPrice: values.originalPrice ? Number(values.originalPrice) : null,
      sortOrder: Number(values.sortOrder || 0),
      inclusions: inclusionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      images: imagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      highlights: values.highlights || [],
    };

    const res = await fetch(
      values._id ? `/api/packages/${values._id}` : "/api/packages",
      {
        method: values._id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Unable to save membership plan");
      return;
    }

    router.push("/admin/packages");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <Field label="Plan title">
        <input
          className="input-field"
          placeholder="e.g. Gold Horizon"
          required
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
      </Field>

      <Field label="Short summary" hint="Shown on plan cards">
        <input
          className="input-field"
          placeholder="One-line plan summary"
          required
          value={values.summary}
          onChange={(e) => setValues({ ...values, summary: e.target.value })}
        />
      </Field>

      <Field label="Full description">
        <textarea
          className="input-field min-h-32"
          placeholder="Detailed membership plan description"
          required
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Offer price (INR)">
          <input
            className="input-field"
            type="number"
            inputMode="numeric"
            placeholder="25000"
            required
            value={values.price || ""}
            onChange={(e) =>
              setValues({ ...values, price: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Original price (INR)" hint="Optional strike-through price">
          <input
            className="input-field"
            type="number"
            inputMode="numeric"
            placeholder="50000"
            value={values.originalPrice || ""}
            onChange={(e) =>
              setValues({
                ...values,
                originalPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Duration">
          <input
            className="input-field"
            placeholder="e.g. 4 Nights / 5 Days"
            required
            value={values.duration}
            onChange={(e) => setValues({ ...values, duration: e.target.value })}
          />
        </Field>
        <Field label="Validity">
          <input
            className="input-field"
            placeholder="e.g. 2 Years Validity"
            value={values.validity || ""}
            onChange={(e) => setValues({ ...values, validity: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Destination">
        <input
          className="input-field"
          placeholder="e.g. India & Select International"
          required
          value={values.destination}
          onChange={(e) => setValues({ ...values, destination: e.target.value })}
        />
      </Field>

      <Field label="Cover image URL">
        <input
          className="input-field"
          placeholder="https://..."
          required
          value={values.coverImage}
          onChange={(e) => setValues({ ...values, coverImage: e.target.value })}
        />
      </Field>

      <Field
        label="Gallery image URLs"
        hint="One image URL per line"
      >
        <textarea
          className="input-field min-h-24"
          placeholder="https://image-1.jpg"
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
        />
      </Field>

      <Field
        label="Inclusions / benefits"
        hint="One benefit per line (hotel, food, trekking, etc.)"
      >
        <textarea
          className="input-field min-h-28"
          placeholder="Premium Resort Stay"
          value={inclusionsText}
          onChange={(e) => setInclusionsText(e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Badge" hint="e.g. MOST POPULAR">
          <input
            className="input-field"
            placeholder="Optional badge"
            value={values.badge || ""}
            onChange={(e) => setValues({ ...values, badge: e.target.value })}
          />
        </Field>
        <Field label="Status">
          <select
            className="input-field"
            value={values.status}
            onChange={(e) =>
              setValues({
                ...values,
                status: e.target.value as "draft" | "published",
              })
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Sort order" hint="Lower numbers show first">
          <input
            className="input-field"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={values.sortOrder ?? 0}
            onChange={(e) =>
              setValues({ ...values, sortOrder: Number(e.target.value) })
            }
          />
        </Field>
      </div>

      <label className="flex min-h-12 items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={Boolean(values.isFeatured)}
          onChange={(e) =>
            setValues({ ...values, isFeatured: e.target.checked })
          }
        />
        Featured plan
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-dark w-full sticky bottom-24 md:static md:bottom-auto"
      >
        {loading ? "Saving..." : values._id ? "Update plan" : "Create plan"}
      </button>
    </form>
  );
}
