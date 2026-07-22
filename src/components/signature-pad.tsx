"use client";

import { useRef, useState, useEffect } from "react";
import { submitSignature } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Eraser, PenLine, Type } from "lucide-react";

export function SignatureForm({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");
  const [hasDrawing, setHasDrawing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0C1218";
  }, [mode]);

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function start(e: React.PointerEvent) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function draw(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawing(true);
  }
  function end() {
    drawing.current = false;
  }
  function clearCanvas() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }

  function signatureData(): string | null {
    if (mode === "draw") {
      return hasDrawing ? canvasRef.current!.toDataURL("image/png") : null;
    }
    if (!typed.trim()) return null;
    // Render typed name to a canvas so we always store an image.
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 160;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0C1218";
    ctx.font = "48px 'Segoe Script', cursive";
    ctx.fillText(typed.trim(), 20, 90);
    return c.toDataURL("image/png");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const sig = signatureData();
    if (!sig) {
      setError("Please draw or type your signature.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("signatureData", sig);
    setSubmitting(true);
    const res = await submitSignature(proposalId, fd);
    setSubmitting(false);
    if (res?.ok) {
      router.push(`/sign/${proposalId}/done`);
    } else {
      setError(res?.error ?? "Something went wrong.");
    }
  }

  const field = "mt-1 w-full rounded-lg border px-3 py-2.5 text-sm bg-white";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm font-medium">Full name *
          <input name="signerName" required className={field} /></label>
        <label className="text-sm font-medium">Role / Title
          <input name="signerRole" className={field} /></label>
        <label className="text-sm font-medium">Company
          <input name="signerCompany" className={field} /></label>
        <label className="text-sm font-medium">Email *
          <input name="signerEmail" type="email" required className={field} /></label>
        <label className="text-sm font-medium sm:col-span-2">Phone
          <input name="signerPhone" className={field} /></label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium">Signature *</span>
          <div className="flex gap-1 text-xs">
            <button type="button" onClick={() => setMode("draw")} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${mode === "draw" ? "bg-[var(--at-ink)] text-white" : "border"}`}><PenLine className="w-3 h-3" /> Draw</button>
            <button type="button" onClick={() => setMode("type")} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${mode === "type" ? "bg-[var(--at-ink)] text-white" : "border"}`}><Type className="w-3 h-3" /> Type</button>
          </div>
        </div>
        {mode === "draw" ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={560}
              height={160}
              onPointerDown={start}
              onPointerMove={draw}
              onPointerUp={end}
              onPointerLeave={end}
              className="w-full rounded-lg border bg-white touch-none cursor-crosshair"
              style={{ height: 160 }}
            />
            <button type="button" onClick={clearCanvas} className="absolute top-2 right-2 inline-flex items-center gap-1 text-xs text-muted hover:text-alert">
              <Eraser className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        ) : (
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type your full name"
            className="w-full rounded-lg border px-3 py-4 text-2xl bg-white"
            style={{ fontFamily: "'Segoe Script', cursive" }}
          />
        )}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input name="termsAccepted" type="checkbox" required className="mt-1" />
        <span>I have read and accept the terms of this proposal, and agree that this constitutes a legally binding electronic signature.</span>
      </label>

      {error && <div className="rounded-lg bg-[#FEE4E4] text-[#B91C1C] text-sm px-3 py-2">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[var(--at-ink)] text-white py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Sign & Accept Proposal"}
      </button>
    </form>
  );
}
