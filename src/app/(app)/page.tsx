import { getDashboardData } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Card, StatCard, StatusBadge } from "@/components/ui";
import { StatusPie, FunnelBar } from "@/components/charts";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const d = await getDashboardData();

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Proposal Dashboard"
        subtitle="Live view of every proposal, its stage, and pipeline performance."
      />

      {d.usingSampleData && (
        <div className="mb-6 rounded-xl border border-[var(--at-indigo-soft)] bg-[#ECEDFF] px-4 py-3 text-sm text-[#3339C4]">
          Showing sample data — connect <code className="font-mono">DATABASE_URL</code> and run the
          migration to see real proposals.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Proposals" value={d.counts.total} />
        <StatCard
          label="Pipeline Value"
          value={formatCurrency(d.pipelineValue)}
          accent="#4D54F5"
        />
        <StatCard
          label="Pending Approval"
          value={d.counts.pendingApproval}
          hint="Awaiting an approver"
        />
        <StatCard
          label="Opened · Not Signed"
          value={d.counts.openedNotSigned}
          hint="Follow-up opportunities"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">Proposals by Status</h2>
          <StatusPie data={d.byStatus} />
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">Conversion Funnel</h2>
          <FunnelBar funnel={d.funnel} />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold">Recent Proposals</h2>
          <Link href="/proposals" className="text-sm text-indigo hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b">
                <th className="font-medium px-5 py-3">Number</th>
                <th className="font-medium px-5 py-3">Title</th>
                <th className="font-medium px-5 py-3">Company</th>
                <th className="font-medium px-5 py-3">Owner</th>
                <th className="font-medium px-5 py-3">Status</th>
                <th className="font-medium px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {d.proposals.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-surface/60">
                  <td className="px-5 py-3 font-mono text-xs">{p.proposalNumber}</td>
                  <td className="px-5 py-3 font-medium">{p.title}</td>
                  <td className="px-5 py-3 text-muted">{p.company}</td>
                  <td className="px-5 py-3 text-muted">{p.owner}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {p.amount ? formatCurrency(p.amount, p.currency) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
