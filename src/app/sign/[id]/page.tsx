import { getProposal } from "@/lib/queries";
import { notFound } from "next/navigation";
import { ContentRender } from "@/components/content-render";
import { SignatureForm } from "@/components/signature-pad";
import { formatCurrency } from "@/lib/utils";
import { Block, ProposalContent } from "@/lib/blocks";
import { CheckCircle2 } from "lucide-react";

function lineTotal(it: { quantity: number; unitPrice: number; discountPct: number; vatPct: number }) {
  return it.quantity * it.unitPrice * (1 - it.discountPct / 100) * (1 + it.vatPct / 100);
}

export default async function SignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProposal(id);
  if (!p) notFound();

  const content = (p.contentJson as unknown as ProposalContent | null) ?? { blocks: [] };
  const blocks: Block[] = Array.isArray(content.blocks) ? content.blocks : [];
  const items = p.lineItems.map((li) => ({
    product: li.product, description: li.description,
    quantity: Number(li.quantity), unitPrice: Number(li.unitPrice),
    discountPct: Number(li.discountPct), vatPct: Number(li.vatPct), isOptional: li.isOptional,
  }));
  const grand = items.filter((i) => !i.isOptional).reduce((s, i) => s + lineTotal(i), 0);
  const alreadySigned = p.status === "SIGNED";
  const canSign = p.status === "SENT" || p.status === "OPENED" || p.status === "APPROVED_FOR_SENDING";

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-[var(--at-ink)] text-white">
        <div className="max-w-[820px] mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="font-semibold">ArchiTech</div>
            <div className="text-[11px] text-white/50">Think Deep. Implement Smart.</div>
          </div>
          <div className="text-right text-xs text-white/60 font-mono">{p.proposalNumber} · V{p.currentVersion}</div>
        </div>
      </header>

      <div className="max-w-[820px] mx-auto px-6 py-8">
        <div className="rounded-[var(--radius-card)] border bg-card shadow-sm p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{p.title}</h1>
          <p className="mt-1 text-sm text-muted">Prepared for {p.company?.name ?? "you"}</p>

          <div className="my-6 h-px bg-border" />
          <ContentRender blocks={blocks} />

          {items.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold mb-3">Pricing</h2>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-surface text-muted text-left">
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 font-medium text-right">Qty</th>
                    <th className="px-4 py-2 font-medium text-right">Unit</th>
                    <th className="px-4 py-2 font-medium text-right">Total</th>
                  </tr></thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{it.product}</td>
                        <td className="px-4 py-2 text-right">{it.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(it.unitPrice, p.currency)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(lineTotal(it), p.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xs text-muted mr-3">Total (incl. VAT)</span>
                <span className="text-xl font-semibold" style={{ color: "#4D54F5" }}>{formatCurrency(grand, p.currency)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border bg-card shadow-sm p-8 mt-4">
          {alreadySigned ? (
            <div className="flex items-center gap-3 text-success">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <div className="font-semibold text-foreground">This proposal has been signed.</div>
                <div className="text-sm text-muted">Thank you — no further action needed.</div>
              </div>
            </div>
          ) : canSign ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Review & Sign</h2>
              <SignatureForm proposalId={p.id} />
            </>
          ) : (
            <div className="text-sm text-muted">
              This proposal isn’t available for signing yet (current status: {p.status.replaceAll("_", " ").toLowerCase()}).
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Your name, email, IP address, and signing time are recorded for the audit trail.
        </p>
      </div>
    </div>
  );
}
