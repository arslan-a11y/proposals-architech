"use client";

import { useTransition } from "react";
import { transitionStatus } from "@/lib/actions";

const ACTIONS_BY_STATUS: Record<string, { action: "submit" | "approve" | "return" | "send"; label: string; primary?: boolean }[]> = {
  DRAFT: [{ action: "submit", label: "Submit for Approval", primary: true }],
  PENDING_APPROVAL: [
    { action: "approve", label: "Approve", primary: true },
    { action: "return", label: "Return for Corrections" },
  ],
  PENDING_CORRECTIONS: [{ action: "submit", label: "Resubmit for Approval", primary: true }],
  APPROVED_FOR_SENDING: [{ action: "send", label: "Send to Customer", primary: true }],
};

export function StatusActions({ proposalId, status }: { proposalId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const actions = ACTIONS_BY_STATUS[status] ?? [];
  if (actions.length === 0) return null;

  return (
    <div className="flex gap-2">
      {actions.map((a) => (
        <button
          key={a.action}
          disabled={pending}
          onClick={() => startTransition(() => transitionStatus(proposalId, a.action))}
          className={
            a.primary
              ? "rounded-lg bg-[var(--at-ink)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              : "rounded-lg border px-4 py-2 text-sm font-medium hover:bg-surface disabled:opacity-50"
          }
        >
          {pending ? "…" : a.label}
        </button>
      ))}
    </div>
  );
}
