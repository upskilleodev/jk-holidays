"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/feedback/toast";

export type ProfileValues = {
  name: string;
  email: string;
  mobile: string;
  memberId: string;
  dateOfBirth: string;
  address: string;
};

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(initial);

  function update<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const res = await fetch("/api/member/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        mobile: values.mobile,
        dateOfBirth: values.dateOfBirth,
        address: values.address,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Could not save profile", "error");
      return;
    }

    if (data.profile) {
      setValues({
        name: data.profile.name,
        email: data.profile.email,
        mobile: data.profile.mobile || "",
        memberId: data.profile.memberId,
        dateOfBirth: data.profile.dateOfBirth || "",
        address: data.profile.address || "",
      });
    }

    toast("Profile updated", "success");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          Full Name
          <input
            className="input-field mt-1"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Email
          <input
            className="input-field mt-1"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Mobile
          <input
            className="input-field mt-1"
            value={values.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Member ID
          <input
            className="input-field mt-1 bg-muted/40 text-muted-foreground"
            value={values.memberId}
            readOnly
            aria-readonly="true"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Date of Birth
          <input
            className="input-field mt-1"
            value={values.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            placeholder="12 Aug 1988"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Address
          <input
            className="input-field mt-1"
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Sector 63, Noida"
            autoComplete="street-address"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-6 disabled:opacity-55"
      >
        {loading ? "Saving…" : "SAVE CHANGES"}
      </button>
    </form>
  );
}
