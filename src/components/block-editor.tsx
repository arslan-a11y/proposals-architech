"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Block, BlockType, BLOCK_LABELS, isRtl } from "@/lib/blocks";
import { saveProposalContent } from "@/lib/actions";
import { ArrowUp, ArrowDown, Trash2, Plus, Check, Loader2 } from "lucide-react";

let seq = 0;
function newId() {
  seq += 1;
  return `blk_${seq}_${Math.round(performance.now())}`;
}

const ADD_MENU: BlockType[] = ["heading", "paragraph", "bulleted-list", "divider", "image", "signature"];

type SaveState = "idle" | "saving" | "saved";

export function BlockEditor({
  proposalId,
  initial,
}: {
  proposalId: string;
  initial: Block[];
}) {
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  const persist = useCallback(
    (next: Block[]) => {
      setState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        await saveProposalContent(proposalId, JSON.stringify({ blocks: next }));
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      }, 700);
    },
    [proposalId]
  );

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    persist(blocks);
  }, [blocks, persist]);

  function update(id: string, patch: Partial<Block>) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function add(type: BlockType) {
    setBlocks((bs) => [...bs, { id: newId(), type, text: "", dir: undefined }]);
  }
  function remove(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
  }
  function move(id: string, dir: -1 | 1) {
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-muted flex items-center gap-1.5">
          {state === "saving" && (<><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>)}
          {state === "saved" && (<><Check className="w-3.5 h-3.5 text-success" /> Saved</>)}
          {state === "idle" && "Autosaves as you type"}
        </div>
      </div>

      <div className="space-y-2">
        {blocks.map((b) => {
          const dir = b.dir ?? (isRtl(b.text) ? "rtl" : "ltr");
          return (
            <div key={b.id} className="group rounded-lg border bg-card p-3 flex gap-2">
              <div className="flex flex-col gap-1 pt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <button onClick={() => move(b.id, -1)} className="p-0.5 hover:text-indigo" aria-label="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => move(b.id, 1)} className="p-0.5 hover:text-indigo" aria-label="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wide text-muted mb-1">{BLOCK_LABELS[b.type]}</div>
                {b.type === "divider" ? (
                  <hr className="border-t my-2" />
                ) : b.type === "image" ? (
                  <input
                    value={b.url ?? ""}
                    onChange={(e) => update(b.id, { url: e.target.value })}
                    placeholder="Image URL (https://…)"
                    className="w-full rounded-md border px-2 py-1.5 text-sm bg-card"
                  />
                ) : b.type === "heading" ? (
                  <input
                    dir={dir}
                    value={b.text ?? ""}
                    onChange={(e) => update(b.id, { text: e.target.value })}
                    placeholder="Heading text"
                    className="w-full rounded-md border px-2 py-1.5 text-base font-semibold bg-card"
                  />
                ) : (
                  <textarea
                    dir={dir}
                    value={b.text ?? ""}
                    onChange={(e) => update(b.id, { text: e.target.value })}
                    placeholder={b.type === "bulleted-list" ? "One item per line" : b.type === "signature" ? "Signature label" : "Paragraph text"}
                    rows={b.type === "bulleted-list" ? 3 : 2}
                    className="w-full rounded-md border px-2 py-1.5 text-sm bg-card resize-y"
                  />
                )}
              </div>
              <button onClick={() => remove(b.id)} className="p-1 text-muted hover:text-alert self-start" aria-label="Delete block">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ADD_MENU.map((t) => (
          <button
            key={t}
            onClick={() => add(t)}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <Plus className="w-3.5 h-3.5" /> {BLOCK_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}
