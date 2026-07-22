import { getTemplates } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";
import { Star } from "lucide-react";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Templates"
        subtitle="Reusable proposal templates by service, language, and brand."
      />

      {templates.length === 0 ? (
        <Card className="p-10 text-center text-muted text-sm">No templates yet.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between">
                <h2 className="font-medium">{t.name}</h2>
                {t.isDefault && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#5B6B00] bg-[#F6FBCF] rounded-full px-2 py-0.5">
                    <Star className="w-3 h-3" /> Default
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {t.category && <span className="rounded-full bg-surface border px-2 py-0.5">{t.category}</span>}
                <span className="rounded-full bg-surface border px-2 py-0.5 uppercase">{t.language}</span>
                <span className="rounded-full bg-surface border px-2 py-0.5">{t.version}</span>
              </div>
              <div className="mt-4 text-xs text-muted">Status: {t.status}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
