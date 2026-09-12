"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Clock,
  Headphones,
  IndianRupee,
  Pencil,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "@/components/feedback/toast";
import {
  BankAccountForm,
  maskAccount,
  type BankDetails,
} from "@/components/wallet/BankAccountForm";
import { cn, formatINR } from "@/lib/utils";

export type WalletTxn = {
  id: string;
  date: string;
  time: string;
  desc: string;
  sub: string;
  type: "Credit" | "Debit";
  amount: number;
  balance: number;
  status?: string;
};

export type WalletWithdrawal = {
  id: string;
  amount: number;
  method: string;
  accountDetails: string;
  remarks: string;
  status: string;
  createdAt: string;
};

type Props = {
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingAmount: number;
  transactions: WalletTxn[];
  withdrawals: WalletWithdrawal[];
  bank: BankDetails;
};

export function MemberWalletPanel({
  balance,
  totalEarnings,
  totalWithdrawn,
  pendingAmount,
  transactions,
  withdrawals,
  bank: initialBank,
}: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<"bank" | "upi">("bank");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);
  const [focus, setFocus] = useState<"tx" | "history" | "pending">("tx");
  const [bank, setBank] = useState<BankDetails>(initialBank);
  const [editingBank, setEditingBank] = useState(false);
  const [upiDraft, setUpiDraft] = useState(initialBank.upiId);
  const [savingUpi, setSavingUpi] = useState(false);

  const available = Math.max(0, balance - pendingAmount);
  const visibleTx = showAllTx ? transactions : transactions.slice(0, 6);
  const hasBank = Boolean(bank.accountNumber);

  async function saveUpi() {
    const value = upiDraft.trim();
    if (!value) {
      toast("Enter your UPI ID", "error");
      return;
    }
    setSavingUpi(true);
    const res = await fetch("/api/member/bank-account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "upi", upiId: value }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingUpi(false);

    if (!res.ok) {
      toast(data.error || "Could not save UPI ID", "error");
      return;
    }
    setBank(data.bank as BankDetails);
    toast("UPI ID saved", "success");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 500) {
      toast("Minimum withdrawal is ₹500", "error");
      return;
    }
    if (value > available) {
      toast(`Available to withdraw: ${formatINR(available)}`, "error");
      return;
    }
    if (method === "bank" && !hasBank) {
      toast("Add your bank account details first", "error");
      setEditingBank(true);
      return;
    }
    if (method === "upi" && !bank.upiId) {
      toast("Save your UPI ID first", "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/member/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: value,
        method,
        remarks: remarks.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Could not submit withdrawal", "error");
      return;
    }

    toast("Withdrawal request submitted", "success");
    setAmount("");
    setRemarks("");
    setFocus("pending");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">My Wallet</h1>
        <div className="text-sm text-muted-foreground">
          Home › My Wallet & Withdrawal
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-navy-gradient p-5 text-white shadow-sm">
          <div className="text-sm text-white/80">Total Wallet Balance</div>
          <div className="mt-2 font-display text-3xl font-bold text-gold">
            {formatINR(balance)}
          </div>
          <div className="mt-1 text-xs text-white/70">Total Available Balance</div>
          <div className="mt-1 text-sm text-emerald-300">
            {formatINR(available)}
          </div>
          <a
            href="#withdraw"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-gold-gradient text-sm font-bold text-navy-deep"
          >
            WITHDRAW NOW
          </a>
        </div>

        <StatCard
          icon={TrendingUp}
          tone="emerald"
          label="Total Earnings"
          value={formatINR(totalEarnings)}
          sub="All Time"
          linkText="View Details"
          onLink={() => setFocus("tx")}
        />
        <StatCard
          icon={Building2}
          tone="blue"
          label="Total Withdrawn"
          value={formatINR(totalWithdrawn)}
          sub="All Time"
          linkText="View History"
          onLink={() => setFocus("history")}
        />
        <StatCard
          icon={Clock}
          tone="amber"
          label="Pending Amount"
          value={formatINR(pendingAmount)}
          sub="Under Process"
          linkText="View Details"
          onLink={() => setFocus("pending")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-navy">
              {focus === "history"
                ? "Withdrawal History"
                : focus === "pending"
                  ? "Pending Withdrawals"
                  : "Recent Transactions"}
            </h3>
            {focus === "tx" ? (
              <button
                type="button"
                onClick={() => setShowAllTx(true)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFocus("tx")}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Back to transactions
              </button>
            )}
          </div>

          {focus === "tx" ? (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 pr-2">Date</th>
                      <th className="pr-2">Description</th>
                      <th className="pr-2">Type</th>
                      <th className="pr-2 text-right">Amount</th>
                      <th className="text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTx.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-muted-foreground"
                        >
                          No transactions yet.
                        </td>
                      </tr>
                    ) : (
                      visibleTx.map((t) => (
                        <tr key={t.id} className="border-b last:border-0">
                          <td className="py-3 pr-2">
                            <div>{t.date}</div>
                            <div className="text-xs text-muted-foreground">
                              {t.time}
                            </div>
                          </td>
                          <td className="pr-2">
                            <div className="font-medium text-navy">{t.desc}</div>
                            <div className="text-xs text-muted-foreground">
                              {t.sub}
                            </div>
                          </td>
                          <td className="pr-2">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                t.type === "Credit"
                                  ? "border-emerald-500 text-emerald-600"
                                  : "border-rose-500 text-rose-600",
                              )}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "pr-2 text-right font-semibold",
                              t.type === "Credit"
                                ? "text-emerald-600"
                                : "text-rose-600",
                            )}
                          >
                            {t.type === "Credit" ? "+" : "-"} {formatINR(t.amount)}
                          </td>
                          <td className="text-right text-navy">
                            {formatINR(t.balance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {transactions.length > 6 ? (
                <button
                  type="button"
                  onClick={() => setShowAllTx((v) => !v)}
                  className="mt-4 w-full rounded-lg border py-2.5 text-xs font-bold tracking-wide text-navy uppercase hover:bg-muted"
                >
                  {showAllTx ? "Show less" : "View all transactions"}
                </button>
              ) : null}
            </>
          ) : (
            <ul className="mt-4 space-y-2">
              {(focus === "pending"
                ? withdrawals.filter((w) => w.status === "pending")
                : withdrawals.filter(
                    (w) => w.status === "approved" || w.status === "paid",
                  )
              ).map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-3"
                >
                  <div>
                    <div className="font-semibold text-navy">
                      {formatINR(w.amount)}{" "}
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {w.method}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(w.createdAt).toLocaleDateString("en-IN")} ·{" "}
                      {w.accountDetails}
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold capitalize text-navy">
                    {w.status}
                  </span>
                </li>
              ))}
              {(focus === "pending"
                ? withdrawals.filter((w) => w.status === "pending")
                : withdrawals.filter(
                    (w) => w.status === "approved" || w.status === "paid",
                  )
              ).length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  Nothing to show here yet.
                </li>
              ) : null}
            </ul>
          )}
        </div>

        <form
          id="withdraw"
          onSubmit={onSubmit}
          className="scroll-mt-24 rounded-2xl border bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-navy">
              Withdraw Money
            </h3>
            <Wallet className="h-6 w-6 text-gold" />
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Available Balance
          </div>
          <div className="font-display text-2xl font-bold text-emerald-600">
            {formatINR(available)}
          </div>

          <div className="mt-4 text-sm font-semibold text-navy">
            Select Withdrawal Method
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["bank", "upi"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "rounded-md border p-2.5 text-sm",
                  method === m
                    ? "border-gold bg-gold-soft/30 font-semibold"
                    : "hover:border-gold/40",
                )}
              >
                {m === "bank" ? "Bank Transfer" : "UPI Transfer"}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {method === "bank" ? (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-navy">
                  <span>Bank Details</span>
                  <button
                    type="button"
                    onClick={() => setEditingBank(true)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Pencil className="h-3 w-3" />
                    {hasBank ? "Update Bank" : "Add Bank"}
                  </button>
                </div>
                {hasBank ? (
                  <dl className="mt-1 space-y-1.5 rounded-lg border bg-muted/40 p-3 text-xs">
                    <BankRow
                      label="Account Number"
                      value={maskAccount(bank.accountNumber)}
                    />
                    <BankRow
                      label="Account Holder Name"
                      value={bank.accountHolderName}
                    />
                    <BankRow label="Bank Name" value={bank.bankName} />
                    {bank.branch ? (
                      <BankRow label="Branch" value={bank.branch} />
                    ) : null}
                    <BankRow label="IFSC code" value={bank.ifsc} />
                  </dl>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingBank(true)}
                    className="mt-1 flex h-11 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground hover:border-gold hover:text-navy"
                  >
                    Add bank account details
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-navy">UPI ID</label>
                <div className="mt-1 flex gap-2">
                  <input
                    className="input-field"
                    value={upiDraft}
                    onChange={(e) => setUpiDraft(e.target.value)}
                    placeholder="yourid@upi"
                  />
                  <button
                    type="button"
                    onClick={saveUpi}
                    disabled={savingUpi || upiDraft.trim() === bank.upiId}
                    className="shrink-0 rounded-lg border px-3 text-xs font-bold text-navy disabled:opacity-50"
                  >
                    {savingUpi ? "Saving…" : "Save"}
                  </button>
                </div>
                {bank.upiId ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Payouts go to {bank.upiId}
                  </p>
                ) : null}
              </div>
            )}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-navy">
                <span>Withdrawal Amount</span>
                <span className="text-muted-foreground">Min. ₹500</span>
              </div>
              <input
                className="input-field mt-1"
                inputMode="numeric"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                {[1000, 2000, 5000, 10000].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(String(a))}
                    className="flex-1 rounded-md border px-2 py-1 text-xs hover:border-gold"
                  >
                    ₹{a.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-navy">
                Remarks (Optional)
              </label>
              <textarea
                className="input-field mt-1 min-h-16 resize-none"
                placeholder="Enter remarks"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gold-gradient text-sm font-bold text-navy-deep disabled:opacity-60"
            >
              {loading ? "Submitting…" : "SUBMIT WITHDRAWAL REQUEST"}
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              ✓ Withdrawals are processed within 24–48 working hours.
            </p>
          </div>
        </form>
      </div>

      <div className="grid gap-4 rounded-2xl bg-navy-gradient p-6 text-white md:grid-cols-4">
        {[
          {
            i: Shield,
            t: "100% Secure",
            d: "Your transactions are fully secure",
          },
          {
            i: Zap,
            t: "Quick Processing",
            d: "Withdrawals processed within 24–48 hours",
          },
          {
            i: IndianRupee,
            t: "No Hidden Charges",
            d: "Zero deduction on withdrawal",
          },
          { i: Headphones, t: "24/7 Support", d: "We are here to help you" },
        ].map(({ i: Icon, t, d }) => (
          <div key={t} className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/50 text-gold">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{t}</div>
              <div className="text-xs text-white/70">{d}</div>
            </div>
          </div>
        ))}
      </div>

      {editingBank ? (
        <BankAccountForm
          bank={bank}
          onClose={() => setEditingBank(false)}
          onSaved={setBank}
        />
      ) : null}
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all text-right font-semibold text-navy">{value}</dd>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  linkText,
  onLink,
}: {
  icon: typeof TrendingUp;
  tone: "emerald" | "blue" | "amber";
  label: string;
  value: string;
  sub: string;
  linkText: string;
  onLink: () => void;
}) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-2xl font-bold text-navy">
            {value}
          </div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
        <div
          className={cn(
            "grid h-12 w-12 place-items-center rounded-full",
            tones[tone],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <button
        type="button"
        onClick={onLink}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
      >
        {linkText} <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
