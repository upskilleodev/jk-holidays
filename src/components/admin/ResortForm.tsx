"use client";

import { FormEvent, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export type ResortFormValues = {
  _id?: string;
  name: string;
  label: string;
  image: string;
  status: "draft" | "published";
  sortOrder?: number;
};

const empty: ResortFormValues = {
  name: "",
  label: "",
  image: "",
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

export function ResortForm({ initial }: { initial?: ResortFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ResortFormValues>(initial || empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...values,
      image: values.image.trim(),
      sortOrder: Number(values.sortOrder || 0),
    };

    const res = await fetch(
      values._id ? `/api/resorts/${values._id}` : "/api/resorts",
      {
        method: values._id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Unable to save resort");
      return;
    }

    router.push("/admin/resorts");
    router.refresh();
  }

  const previewSrc = values.image.trim();
  const canPreview =
    previewSrc.startsWith("http://") ||
    previewSrc.startsWith("https://") ||
    previewSrc.startsWith("/");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        href="/admin/resorts"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to resorts
      </Link>

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Resort / destination name">
          <input
            className="input-field"
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            placeholder="Maldives"
          />
        </Field>

        <Field label="Subtitle / location label">
          <input
            className="input-field"
            required
            value={values.label}
            onChange={(e) => setValues({ ...values, label: e.target.value })}
            placeholder="Overwater Villas"
          />
        </Field>

        <Field
          label="Image link"
          hint="Paste a full image URL (https://…). Preview updates below."
        >
          <input
            className="input-field"
            required
            type="text"
            inputMode="url"
            autoComplete="url"
            value={values.image}
            onChange={(e) => setValues({ ...values, image: e.target.value })}
            placeholder="https://images.unsplash.com/photo-…"
          />
        </Field>

        {canPreview ? (
          <div className="relative h-40 overflow-hidden rounded-xl border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={values.name || "Resort preview"}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
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
          <Field label="Sort order">
            <input
              className="input-field"
              type="number"
              value={values.sortOrder ?? 0}
              onChange={(e) =>
                setValues({ ...values, sortOrder: Number(e.target.value) })
              }
            />
          </Field>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className="btn-dark" disabled={loading}>
            {loading
              ? "Saving…"
              : values._id
                ? "Update resort"
                : "Create resort"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={loading}
            onClick={() => router.push("/admin/resorts")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
