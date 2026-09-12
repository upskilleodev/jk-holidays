"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { toast } from "@/components/feedback/toast";

export type BankDetails = {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  branch: string;
  ifsc: string;
  upiId: string;
};

export const emptyBank: BankDetails = {
  accountNumber: "",
  accountHolderName: "",
  bankName: "",
  branch: "",
  ifsc: "",
  upiId: "",
};

export function maskAccount(accountNumber: string) {
  if (accountNumber.length <= 4) return accountNumber;
  return `${"•".repeat(Math.min(8, accountNumber.length - 4))}${accountNumber.slice(-4)}`;
}

type Props = {
  bank: BankDetails;
  onClose: () => void;
  onSaved: (bank: BankDetails) => void;
};

export function BankAccountForm({ bank, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    accountNumber: bank.accountNumber,
    accountHolderName: bank.accountHolderName,
    bankName: bank.bankName,
    branch: bank.branch,
    ifsc: bank.ifsc,
  });
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const res = await fetch("/api/member/bank-account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "bank", ...form }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Could not save bank account", "error");
      return;
    }

    toast("Bank account updated", "success");
    onSaved(data.bank as BankDetails);
    onClose();
  }

  const fields: {
    key: keyof typeof form;
    label: string;
    placeholder: string;
    inputMode?: "numeric";
    uppercase?: boolean;
  }[] = [
    {
      key: "accountNumber",
      label: "Account Number",
      placeholder: "Enter account number",
      inputMode: "numeric",
    },
    {
      key: "accountHolderName",
      label: "Account Holder Name",
      placeholder: "Name as per bank records",
    },
    { key: "bankName", label: "Bank Name", placeholder: "e.g. Axis Bank" },
    { key: "branch", label: "Branch", placeholder: "Branch name" },
    {
      key: "ifsc",
      label: "IFSC code",
      placeholder: "e.g. UTIB0005411",
      uppercase: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/50"
        aria-label="Close"
        onClick={() => !loading && onClose()}
      />
      <form
        onSubmit={onSubmit}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-white p-5 shadow-xl"
      >
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-display text-2xl font-bold text-navy">
          Bank Account
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Payouts are transferred to this account. Make sure the details match
          your bank records.
        </p>

        <div className="mt-5 space-y-4">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="text-xs font-semibold text-navy">
                {field.label}
              </span>
              <input
                className="input-field mt-1"
                value={form[field.key]}
                inputMode={field.inputMode}
                placeholder={field.placeholder}
                onChange={(e) =>
                  set(
                    field.key,
                    field.uppercase
                      ? e.target.value.toUpperCase()
                      : e.target.value,
                  )
                }
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-navy text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? "Saving…" : "Update Bank"}
        </button>
      </form>
    </div>
  );
}
