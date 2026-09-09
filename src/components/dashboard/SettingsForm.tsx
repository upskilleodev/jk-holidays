"use client";

import { FormEvent, useState } from "react";
import { toast } from "@/components/feedback/toast";

export type SettingsValues = {
  language: "English" | "Hindi";
  currency: "INR" | "USD" | "AED";
  notifyEmail: boolean;
  notifySms: boolean;
  notifyOffers: boolean;
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [values, setValues] = useState(initial);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (password && password !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    if (password && password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/member/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        confirmPassword,
        language: values.language,
        currency: values.currency,
        notifyEmail: values.notifyEmail,
        notifySms: values.notifySms,
        notifyOffers: values.notifyOffers,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Could not save settings", "error");
      return;
    }

    setPassword("");
    setConfirmPassword("");
    toast(
      data.settings?.passwordUpdated
        ? "Password and settings saved"
        : "Settings saved",
      "success",
    );
  }

  return (
    <form onSubmit={onSubmit} className="mobile-card space-y-4 p-6">
      <div>
        <label className="text-sm font-semibold text-navy">Change Password</label>
        <input
          type="password"
          className="input-field mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          autoComplete="new-password"
          minLength={6}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-navy">Confirm Password</label>
        <input
          type="password"
          className="input-field mt-1"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-navy">Language</label>
        <select
          className="input-field mt-1"
          value={values.language}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              language: e.target.value as SettingsValues["language"],
            }))
          }
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-navy">Currency</label>
        <select
          className="input-field mt-1"
          value={values.currency}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              currency: e.target.value as SettingsValues["currency"],
            }))
          }
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="AED">AED (د.إ)</option>
        </select>
      </div>

      <div className="space-y-3 border-t border-border/60 pt-4">
        <div className="text-sm font-semibold text-navy">Notifications</div>
        {(
          [
            ["notifyEmail", "Email updates on bookings & tickets"],
            ["notifySms", "SMS alerts for travel status"],
            ["notifyOffers", "Offers & discount announcements"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-3 text-sm text-navy"
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--gold,#c9a227)]"
              checked={values[key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [key]: e.target.checked }))
              }
            />
            {label}
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 items-center justify-center rounded-md bg-gold-gradient px-5 text-sm font-bold tracking-wide text-navy-deep disabled:opacity-60"
      >
        {loading ? "Saving..." : "SAVE"}
      </button>
    </form>
  );
}
