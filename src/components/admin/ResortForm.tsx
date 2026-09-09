"use client";

import { FormEvent, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "@/components/feedback/toast";

export type ResortFormValues = {
  _id?: string;
  name: string;
  label: string;
  image: string;
  photos: string[];
  description: string;
  status: "draft" | "published";
  sortOrder?: number;
};

const empty: ResortFormValues = {
  name: "",
  label: "",
  image: "",
  photos: [],
  description: "",
  status: "published",
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
      {hint ? (
        <span className="block text-[11px] text-stone/80">{hint}</span>
      ) : null}
    </label>
  );
}

export function ResortForm({ initial }: { initial?: ResortFormValues }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ResortFormValues>({
    ...empty,
    ...initial,
    photos: initial?.photos?.length
      ? initial.photos
      : initial?.image
        ? [initial.image]
        : [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const gallery = values.photos.length
    ? values.photos
    : values.image
      ? [values.image]
      : [];

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const body = new FormData();
    Array.from(files).forEach((f) => body.append("files", f));
    const res = await fetch("/api/admin/uploads", {
      method: "POST",
      body,
    });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      toast(data.error || "Upload failed", "error");
      return;
    }
    const urls = (data.urls || []) as string[];
    setValues((prev) => {
      const photos = [...prev.photos, ...urls].slice(0, 12);
      return {
        ...prev,
        photos,
        image: prev.image || photos[0] || "",
      };
    });
    toast(`${urls.length} photo(s) uploaded`, "success");
  }

  function removePhoto(url: string) {
    setValues((prev) => {
      const photos = prev.photos.filter((p) => p !== url);
      const image =
        prev.image === url ? photos[0] || "" : prev.image || photos[0] || "";
      return { ...prev, photos, image };
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const cover = values.image || values.photos[0];
    if (!cover) {
      setError("Add at least one property photo");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      name: values.name.trim(),
      label: values.label.trim(),
      image: cover.trim(),
      photos: (values.photos.length ? values.photos : [cover]).map((p) =>
        p.trim(),
      ),
      description: values.description.trim(),
      status: values.status,
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
      setError(data.error || "Unable to save property");
      return;
    }

    toast(values._id ? "Property updated" : "Property added", "success");
    router.push("/admin/resorts");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/admin/resorts"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to resorts
      </Link>

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Property name">
          <input
            className="input-field"
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            placeholder="Taj Maldives Resort"
          />
        </Field>

        <Field label="Location / subtitle">
          <input
            className="input-field"
            required
            value={values.label}
            onChange={(e) => setValues({ ...values, label: e.target.value })}
            placeholder="Overwater Villas"
          />
        </Field>

        <Field label="Short description">
          <textarea
            className="input-field min-h-24 resize-none"
            value={values.description}
            onChange={(e) =>
              setValues({ ...values, description: e.target.value })
            }
            placeholder="Premium member stay with breakfast and transfers…"
          />
        </Field>

        <div className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-navy">
                Property photos
              </div>
              <p className="text-xs text-muted-foreground">
                Upload images or paste a cover URL. First photo is the cover
                unless you pick another.
              </p>
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-bold text-white disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Uploading…" : "Upload photos"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <Field
            label="Cover image URL (optional)"
            hint="Also accepts /assets/… or https://… links"
          >
            <input
              className="input-field"
              type="text"
              inputMode="url"
              value={values.image}
              onChange={(e) => setValues({ ...values, image: e.target.value })}
              placeholder="https://… or /uploads/resorts/…"
            />
          </Field>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {gallery.map((src) => {
                const isCover = (values.image || gallery[0]) === src;
                return (
                  <div
                    key={src}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="180px"
                      unoptimized={src.startsWith("http")}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-navy-deep/70 p-1.5">
                      <button
                        type="button"
                        onClick={() => setValues({ ...values, image: src })}
                        className={`flex-1 rounded px-1 py-1 text-[10px] font-bold ${
                          isCover
                            ? "bg-gold text-navy-deep"
                            : "bg-white/15 text-white"
                        }`}
                      >
                        {isCover ? "Cover" : "Set cover"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(src)}
                        className="rounded bg-white/15 p-1 text-white"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-navy/20 bg-muted/40 px-4 py-10 text-sm text-muted-foreground hover:bg-muted"
            >
              <ImagePlus className="h-6 w-6 text-gold" />
              Add property photos
            </button>
          )}
        </div>

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
                ? "Update property"
                : "Add property"}
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
