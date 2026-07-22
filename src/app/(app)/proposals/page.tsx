import { getDashboardData } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Card, StatusBadge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProposalsPage() {
  const d = await getDashboardData();

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Proposals"
        subtitle="Every proposal across the full lifecycle."
        action={
          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--at-ink)] text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            New Proposal
          </Link>
        }
      />

      <Card>
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
                  <td className="px-5 py-3 font-mono text-xs">
                    {d.usingSampleData ? (
                      p.proposalNumber
                    ) : (
                      <Link href={`/proposals/${p.id}`} className="text-indigo hover:underline">
                        {p.proposalNumber}
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {d.usingSampleData ? (
                      p.title
                    ) : (
                      <Link href={`/proposals/${p.id}`} className="hover:underline">
                        {p.title}
                      </Link>
                    )}
                  </td>
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
