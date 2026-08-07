import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Withdrawals" };

const rows = [
  {
    id: "WD-1042",
    member: "Rahul Sharma",
    amount: "₹ 5,000",
    method: "UPI",
    status: "Pending",
  },
  {
    id: "WD-1041",
    member: "Neha Verma",
    amount: "₹ 12,500",
    method: "Bank",
    status: "Paid",
  },
  {
    id: "WD-1040",
    member: "Amit Kumar",
    amount: "₹ 2,000",
    method: "UPI",
    status: "Rejected",
  },
];

export default function AdminWithdrawalsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Withdrawals"
        description="Member cashback withdrawal requests. Demo queue for ops review."
      />
      <div className="mobile-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="py-2">ID</th>
              <th>Member</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="py-3 font-mono text-xs">{r.id}</td>
                <td>{r.member}</td>
                <td>{r.amount}</td>
                <td>{r.method}</td>
                <td>
                  <span
                    className={`status-pill ${
                      r.status === "Paid"
                        ? "status-active"
                        : r.status === "Rejected"
                          ? "status-rejected"
                          : "status-pending"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="text-right">
                  <button type="button" className="text-xs font-semibold text-navy">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
