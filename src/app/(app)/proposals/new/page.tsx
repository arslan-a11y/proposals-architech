import { getCreateOptions } from "@/lib/queries";
import { createProposal } from "@/lib/actions";
import { Card } from "@/components/ui";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewProposalPage() {
  const { opportunities, templates } = await getCreateOptions();

  async function action(formData: FormData) {
    "use server";
    const proposalId = await createProposal(formData);
    redirect(`/proposals/${proposalId}`);
  }

  return (
    <div className="p-8 max-w-[720px] mx-auto">
      <Link href="/proposals" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Proposals
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">New Proposal</h1>

      <Card className="p-6">
        <form action={action} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Opportunity</label>
            <p className="text-xs text-muted mb-1.5">Company is pulled automatically from the selected opportunity.</p>
            <select name="opportunityId" className="w-full rounded-lg border px-3 py-2.5 text-sm bg-card" defaultValue="">
              <option value="">— None —</option>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}{o.company ? ` · ${o.company.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Template</label>
            <select name="templateId" className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm bg-card" defaultValue={templates.find((t) => t.isDefault)?.id ?? ""}>
              <option value="">— None —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.isDefault ? " (default)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Title</label>
            <input name="title" placeholder="Leave blank to use the opportunity name" className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm bg-card" />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="submit" className="rounded-lg bg-[var(--at-ink)] text-white px-5 py-2.5 text-sm font-medium hover:opacity-90">
              Create Proposal
            </button>
            <Link href="/proposals" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-surface">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
