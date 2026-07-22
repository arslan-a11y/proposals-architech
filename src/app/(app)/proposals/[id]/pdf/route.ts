import { getProposal } from "@/lib/queries";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ProposalPdf, type PdfData } from "@/lib/pdf-document";
import { Block, ProposalContent } from "@/lib/blocks";
import { createElement, type ReactElement } from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = await getProposal(id);
  if (!p) return new Response("Not found", { status: 404 });

  const content = (p.contentJson as unknown as ProposalContent | null) ?? { blocks: [] };
  const blocks: Block[] = Array.isArray(content.blocks) ? content.blocks : [];

  const data: PdfData = {
    proposalNumber: p.proposalNumber,
    title: p.title,
    version: p.currentVersion,
    company: p.company?.name ?? "—",
    currency: p.currency,
    blocks,
    lineItems: p.lineItems.map((li) => ({
      product: li.product,
      description: li.description,
      quantity: Number(li.quantity),
      unitPrice: Number(li.unitPrice),
      discountPct: Number(li.discountPct),
      vatPct: Number(li.vatPct),
      isOptional: li.isOptional,
    })),
    signatures: p.signatures.map((sg) => ({
      signerName: sg.signerName,
      signerRole: sg.signerRole,
      signerEmail: sg.signerEmail,
      signedAt: sg.signedAt.toISOString().slice(0, 16).replace("T", " "),
      ipAddress: sg.ipAddress,
    })),
  };

  const element = createElement(ProposalPdf, { data }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${p.proposalNumber}.pdf"`,
    },
  });
}
