import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { isReportSlug, REPORT_TYPES } from "@/lib/admin-reports";
import { User } from "@/models/User";
import { Purchase } from "@/models/Purchase";
import { Booking } from "@/models/Booking";
import { CashbackReward } from "@/models/CashbackReward";
import { ContactMessage } from "@/models/ContactMessage";
import { HolidayRequest } from "@/models/HolidayRequest";
import { Withdrawal } from "@/models/Withdrawal";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ export?: string }>;
};

function memberIdFrom(user: {
  _id: { toString(): string };
  referralCode?: string;
}) {
  const tail = user._id.toString().slice(-6).toUpperCase();
  return user.referralCode?.startsWith("JK") ? user.referralCode : `JK${tail}`;
}

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: Props) {
  const { type } = await params;
  const sp = await searchParams;
  if (!isReportSlug(type)) notFound();

  const meta = REPORT_TYPES.find((r) => r.slug === type)!;
  await connectDB();

  let headers: string[] = [];
  let rows: string[][] = [];
  let preview: { title: string; cells: string[] }[] = [];

  if (type === "membership") {
    const users = await User.find({ role: "user" })
      .select("name email mobile referralCode accountStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    const purchases = await Purchase.find()
      .populate("packageId", "title")
      .lean();
    const planByUser = new Map(
      purchases.map((p) => {
        const pkg = p.packageId as { title?: string } | null;
        return [String(p.userId), pkg?.title || p.status] as const;
      }),
    );
    headers = [
      "Member ID",
      "Name",
      "Email",
      "Mobile",
      "Plan",
      "Status",
      "Joined",
    ];
    rows = users.map((u) => [
      memberIdFrom(u),
      u.name,
      u.email,
      u.mobile || "",
      planByUser.get(String(u._id)) || "—",
      u.accountStatus || "active",
      new Date(u.createdAt).toLocaleDateString("en-IN"),
    ]);
    preview = rows.slice(0, 50).map((r) => ({
      title: r[1],
      cells: [r[0], r[2], r[4], r[5]],
    }));
  }

  if (type === "bookings") {
    const bookings = await Booking.find().sort({ startDate: -1 }).limit(200).lean();
    headers = [
      "Client",
      "Email",
      "Destination",
      "Resort",
      "Start",
      "End",
      "Status",
    ];
    rows = bookings.map((b) => [
      b.clientName,
      b.clientEmail || "",
      b.destination,
      b.resort || "",
      b.startDate,
      b.endDate,
      b.status,
    ]);
    preview = rows.slice(0, 50).map((r) => ({
      title: r[0],
      cells: [r[2], `${r[4]} → ${r[5]}`, r[6]],
    }));
  }

  if (type === "financial") {
    const purchases = await Purchase.find()
      .populate("userId", "name email")
      .populate("packageId", "title")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    headers = ["Member", "Email", "Plan", "Amount", "Status", "Date"];
    rows = purchases.map((p) => {
      const user = p.userId as unknown as { name?: string; email?: string };
      const pkg = p.packageId as unknown as { title?: string };
      return [
        user?.name || "Member",
        user?.email || "",
        pkg?.title || "—",
        String(p.priceSnapshot || 0),
        p.status,
        new Date(p.createdAt).toLocaleDateString("en-IN"),
      ];
    });
    preview = rows.slice(0, 50).map((r) => ({
      title: r[0],
      cells: [r[2], formatINR(Number(r[3]) || 0), r[4]],
    }));
  }

  if (type === "referral") {
    const rewards = await CashbackReward.find()
      .populate("referrerUserId", "name email referralCode")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    headers = ["Referrer", "Email", "Code", "Amount", "Status", "Source", "Date"];
    rows = rewards.map((r) => {
      const user = r.referrerUserId as unknown as {
        name?: string;
        email?: string;
        referralCode?: string;
      };
      return [
        user?.name || "Member",
        user?.email || "",
        user?.referralCode || "",
        String(r.amount || 0),
        r.status,
        r.source || "",
        new Date(r.createdAt).toLocaleDateString("en-IN"),
      ];
    });
    preview = rows.slice(0, 50).map((r) => ({
      title: r[0],
      cells: [r[2], formatINR(Number(r[3]) || 0), r[4]],
    }));
  }

  if (type === "support") {
    const tickets = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    headers = ["Name", "Email", "Phone", "Subject", "Source", "Date", "Message"];
    rows = tickets.map((t) => [
      t.name,
      t.email,
      t.phone || "",
      t.subject || "General",
      t.source || "contact",
      new Date(t.createdAt).toLocaleDateString("en-IN"),
      (t.message || "").slice(0, 200),
    ]);
    preview = rows.slice(0, 50).map((r) => ({
      title: r[0],
      cells: [r[1], r[3], r[5]],
    }));
  }

  if (type === "activity") {
    const [users, requests, withdrawals, purchases] = await Promise.all([
      User.find({ role: "user" })
        .sort({ createdAt: -1 })
        .limit(30)
        .select("name createdAt")
        .lean(),
      HolidayRequest.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .populate("userId", "name")
        .lean(),
      Withdrawal.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .populate("userId", "name")
        .lean(),
      Purchase.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .populate("userId", "name")
        .lean(),
    ]);

    headers = ["When", "Type", "Actor", "Detail"];
    const events: { when: Date; type: string; actor: string; detail: string }[] =
      [
        ...users.map((u) => ({
          when: new Date(u.createdAt),
          type: "Member signup",
          actor: u.name,
          detail: "New member registered",
        })),
        ...requests.map((r) => {
          const user = r.userId as unknown as { name?: string };
          return {
            when: new Date(r.createdAt),
            type: "Holiday request",
            actor: user?.name || "Member",
            detail: `${r.requestId} · ${r.destination} · ${r.status}`,
          };
        }),
        ...withdrawals.map((w) => {
          const user = w.userId as unknown as { name?: string };
          return {
            when: new Date(w.createdAt),
            type: "Withdrawal",
            actor: user?.name || "Member",
            detail: `${formatINR(w.amount)} · ${w.status}`,
          };
        }),
        ...purchases.map((p) => {
          const user = p.userId as unknown as { name?: string };
          return {
            when: new Date(p.createdAt),
            type: "Plan purchase",
            actor: user?.name || "Member",
            detail: `${formatINR(p.priceSnapshot)} · ${p.status}`,
          };
        }),
      ];

    events.sort((a, b) => b.when.getTime() - a.when.getTime());
    rows = events.slice(0, 200).map((e) => [
      e.when.toLocaleString("en-IN"),
      e.type,
      e.actor,
      e.detail,
    ]);
    preview = rows.slice(0, 50).map((r) => ({
      title: r[1],
      cells: [r[0], r[2], r[3]],
    }));
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        All reports
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.description}. Showing {rows.length} row
            {rows.length === 1 ? "" : "s"}.
          </p>
        </div>
        <ExportCsvButton
          filename={`jk-${type}-report`}
          headers={headers}
          rows={rows}
        />
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No data available for this report yet.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    {headers.map((h) => (
                      <th key={h} className="py-2 pr-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {row.map((cell, j) => (
                        <td
                          key={`${i}-${j}`}
                          className={`py-3 pr-3 ${j === 0 ? "font-medium text-navy" : ""}`}
                        >
                          {headers[j]?.toLowerCase().includes("amount")
                            ? formatINR(Number(cell) || 0)
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {preview.map((item, i) => (
                <article
                  key={i}
                  className="rounded-xl border border-border/80 p-4"
                >
                  <div className="font-semibold text-navy">{item.title}</div>
                  <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {item.cells.map((c, j) => (
                      <div key={j}>{c}</div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {sp.export === "1" ? (
        <p className="text-xs text-muted-foreground">
          Use <strong>Export data</strong> above to download this report as CSV.
        </p>
      ) : null}
    </div>
  );
}
