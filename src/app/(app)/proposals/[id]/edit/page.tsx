import { getProposal } from "@/lib/queries";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { BlockEditor } from "@/components/block-editor";
import { Block, ProposalContent } from "@/lib/blocks";
import { ArrowLeft } from "lucide-react";

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProposal(id);
  if (!p) notFound();

  const editable = p.status === "DRAFT" || p.status === "PENDING_CORRECTIONS";
  if (!editable) redirect(`/proposals/${id}`);

  const content = (p.contentJson as unknown as ProposalContent | null) ?? { blocks: [] };
  const blocks: Block[] = Array.isArray(content.blocks) ? content.blocks : [];

  return (
    <div className="p-8 max-w-[860px] mx-auto">
      <Link href={`/proposals/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to proposal
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Edit content</h1>
      <p className="text-sm text-muted mb-6 font-mono">{p.proposalNumber} · {p.title}</p>

      <Card className="p-5">
        <BlockEditor proposalId={p.id} initial={blocks} />
      </Card>
    </div>
  );
}
