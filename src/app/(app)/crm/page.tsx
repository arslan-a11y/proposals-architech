import { getCrmData } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

const STAGE_LABEL: Record<string, string> = {
  NEW: "New",
  REQUIREMENTS: "Requirements",
  QUOTE_SENT: "Quote Sent",
  FOLLOW_UP: "Follow-up",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

export default async function CrmPage() {
  const { companies, opportunities, contacts } = await getCrmData();

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="CRM"
        subtitle="Opportunities, companies, and contacts — owned by this app's database."
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5"><div className="text-sm text-muted">Companies</div><div className="mt-1 text-3xl font-semibold">{companies.length}</div></Card>
        <Card className="p-5"><div className="text-sm text-muted">Opportunities</div><div className="mt-1 text-3xl font-semibold">{opportunities.length}</div></Card>
        <Card className="p-5"><div className="text-sm text-muted">Contacts</div><div className="mt-1 text-3xl font-semibold">{contacts.length}</div></Card>
      </div>

      <Card className="mb-6">
        <div className="px-5 py-3.5 border-b"><h2 className="text-sm font-semibold">Opportunities</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted border-b">
              <th className="font-medium px-5 py-3">Name</th>
              <th className="font-medium px-5 py-3">Company</th>
              <th className="font-medium px-5 py-3">Service</th>
              <th className="font-medium px-5 py-3">Stage</th>
              <th className="font-medium px-5 py-3 text-right">Value</th>
            </tr></thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-surface/60">
                  <td className="px-5 py-3 font-medium">{o.name}</td>
                  <td className="px-5 py-3 text-muted">{o.company?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{o.requestedService ?? "—"}</td>
                  <td className="px-5 py-3">{STAGE_LABEL[o.stage] ?? o.stage}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{o.value ? formatCurrency(Number(o.value), o.currency) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-5 py-3.5 border-b"><h2 className="text-sm font-semibold">Companies</h2></div>
          <ul className="divide-y">
            {companies.map((c) => (
              <li key={c.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted">
                  {c.isCustomer ? "Customer" : "Prospect"} · {c._count.proposals} proposals
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="px-5 py-3.5 border-b"><h2 className="text-sm font-semibold">Contacts</h2></div>
          <ul className="divide-y">
            {contacts.map((c) => (
              <li key={c.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <span className="font-medium">{c.fullName}</span>
                <span className="text-xs text-muted">{c.company?.name ?? "—"} · {c.email ?? ""}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
