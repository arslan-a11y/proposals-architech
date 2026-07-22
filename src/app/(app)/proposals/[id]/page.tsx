import { getProposal } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, StatusBadge } from "@/components/ui";
import { PricingTable } from "@/components/pricing-table";
import { StatusActions } from "@/components/status-actions";
import { ContentRender } from "@/components/content-render";
import { formatCurrency, STATUS_META } from "@/lib/utils";
import { Block, ProposalContent } from "@/lib/blocks";
import { ArrowLeft, Pencil, FileDown } from "lucide-react";

export default async function ProposalDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProposal(id);
  if (!p) notFound();

  const editable = p.status === "DRAFT" || p.status === "PENDING_CORRECTIONS";
  const content = (p.contentJson as unknown as ProposalContent | null) ?? { blocks: [] };
  const blocks: Block[] = Array.isArray(content.blocks) ? content.blocks : [];

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      <Link href="/proposals" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Proposals
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{p.title}</h1>
            <StatusBadge status={p.status} />
          </div>
          <p className="mt-1 text-sm text-muted font-mono">
            {p.proposalNumber} · V{p.currentVersion}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/proposals/${p.id}/pdf`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-surface"
          >
            <FileDown className="w-4 h-4" /> PDF
          </a>
          <StatusActions proposalId={p.id} status={p.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="text-xs text-muted">Company</div>
          <div className="mt-1 font-medium">{p.company?.name ?? "—"}</div>
          <div className="mt-3 text-xs text-muted">Opportunity</div>
          <div className="mt-1 text-sm">{p.opportunity?.name ?? "—"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted">Owner</div>
          <div className="mt-1 font-medium">{p.owner?.name ?? "—"}</div>
          <div className="mt-3 text-xs text-muted">Recipients</div>
          <div className="mt-1 text-sm">
            {p.contacts.map((c) => c.contact.fullName).join(", ") || "—"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted">Amount (incl. VAT)</div>
          <div className="mt-1 text-2xl font-semibold" style={{ color: "#4D54F5" }}>
            {formatCurrency(Number(p.amount), p.currency)}
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span>Approval: <b style={{ color: STATUS_META[p.status]?.text }}>{p.approvalStatus}</b></span>
            <span>Sig: <b>{p.signatureStatus}</b></span>
          </div>
        </Card>
      </div>

      <Card className="mb-4">
        <div className="px-5 py-3.5 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Content</h2>
          {editable && (
            <Link
              href={`/proposals/${p.id}/edit`}
              className="inline-flex items-center gap-1.5 text-sm text-indigo hover:underline"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit content
            </Link>
          )}
        </div>
        <div className="p-5">
          <ContentRender blocks={blocks} />
        </div>
      </Card>

      <Card className="mb-4">
        <div className="px-5 py-3.5 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Pricing</h2>
          {!editable && <span className="text-xs text-muted">Locked — proposal is {STATUS_META[p.status]?.label ?? p.status}</span>}
        </div>
        <PricingTable
          proposalId={p.id}
          currency={p.currency}
          editable={editable}
          items={p.lineItems.map((li) => ({
            id: li.id,
            product: li.product,
            description: li.description,
            quantity: Number(li.quantity),
            unitPrice: Number(li.unitPrice),
            discountPct: Number(li.discountPct),
            vatPct: Number(li.vatPct),
            isOptional: li.isOptional,
          }))}
        />
      </Card>

      {(p.status === "SENT" || p.status === "OPENED" || p.status === "APPROVED_FOR_SENDING" || p.signatures.length > 0) && (
        <Card className="mb-4 p-5">
          <h2 className="text-sm font-semibold mb-3">Signing</h2>
          {p.signatures.length > 0 ? (
            <ul className="space-y-3">
              {p.signatures.map((sg) => (
                <li key={sg.id} className="flex items-center gap-3 text-sm">
                  {sg.signatureImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sg.signatureImageUrl} alt="signature" className="h-10 w-24 object-contain border rounded bg-white" />
                  )}
                  <div>
                    <div className="font-medium">{sg.signerName} <span className="text-muted font-normal">· {sg.signerRole ?? "—"}</span></div>
                    <div className="text-xs text-muted">{sg.signerEmail} · order {sg.signingOrder} · IP {sg.ipAddress ?? "—"} · V{sg.versionSigned}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm">
              <p className="text-muted mb-2">Share this secure signing link with the customer:</p>
              <code className="block rounded-lg border bg-surface px-3 py-2 text-xs break-all">/sign/{p.id}</code>
            </div>
          )}
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-3">Activity</h2>
          <ul className="space-y-2 text-sm">
            {p.activities.length === 0 && <li className="text-muted">No activity yet.</li>}
            {p.activities.map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo" />
                <span className="text-muted">{a.type.replaceAll("_", " ").toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-3">Versions</h2>
          <ul className="space-y-2 text-sm">
            {p.versions.length === 0 && <li className="text-muted">No frozen versions yet — created at send time.</li>}
            {p.versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between">
                <span className="font-mono">V{v.versionNumber}</span>
                <StatusBadge status={v.statusAtTime} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
