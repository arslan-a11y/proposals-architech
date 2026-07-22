import { Block, isRtl } from "@/lib/blocks";

function dirOf(b: Block) {
  return b.dir ?? (isRtl(b.text) ? "rtl" : "ltr");
}

export function ContentRender({ blocks }: { blocks: Block[] }) {
  if (!blocks?.length) {
    return <p className="text-sm text-muted">No content yet.</p>;
  }
  return (
    <div className="space-y-3">
      {blocks.map((b) => {
        const dir = dirOf(b);
        switch (b.type) {
          case "heading":
            return (
              <h3 key={b.id} dir={dir} className="text-lg font-semibold">
                {b.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={b.id} dir={dir} className="text-sm leading-relaxed whitespace-pre-wrap">
                {b.text}
              </p>
            );
          case "bulleted-list":
            return (
              <ul key={b.id} dir={dir} className="list-disc ms-5 text-sm space-y-1">
                {(b.text ?? "").split("\n").filter(Boolean).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            );
          case "divider":
            return <hr key={b.id} className="border-t" />;
          case "image":
            return b.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={b.id} src={b.url} alt="" className="max-w-full rounded-lg border" />
            ) : (
              <div key={b.id} className="text-xs text-muted border border-dashed rounded-lg p-4 text-center">
                Image (no URL set)
              </div>
            );
          case "signature":
            return (
              <div key={b.id} dir={dir} className="mt-4 border-t pt-4 text-sm">
                <div className="font-medium mb-6">{b.text || "Signature"}</div>
                <div className="flex gap-10 text-muted">
                  <div>Name: ______________</div>
                  <div>Date: ______________</div>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
