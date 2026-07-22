"use client";

import { useState, useTransition } from "react";
import { addLineItem, deleteLineItem } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

type LineItem = {
  id: string;
  product: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  vatPct: number;
  isOptional: boolean;
};

const PRODUCTS = ["אפיון", "פרויקט", "דיסקברי"];

function lineTotal(it: LineItem) {
  const base = it.quantity * it.unitPrice;
  const afterDisc = base * (1 - it.discountPct / 100);
  return afterDisc * (1 + it.vatPct / 100);
}

export function PricingTable({
  proposalId,
  items,
  currency,
  editable,
}: {
  proposalId: string;
  items: LineItem[];
  currency: string;
  editable: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  const grandTotal = items
    .filter((i) => !i.isOptional)
    .reduce((s, i) => s + lineTotal(i), 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b">
              <th className="font-medium px-4 py-2.5">Product</th>
              <th className="font-medium px-4 py-2.5">Description</th>
              <th className="font-medium px-4 py-2.5 text-right">Qty</th>
              <th className="font-medium px-4 py-2.5 text-right">Unit</th>
              <th className="font-medium px-4 py-2.5 text-right">VAT%</th>
              <th className="font-medium px-4 py-2.5 text-right">Total</th>
              {editable && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={editable ? 7 : 6} className="px-4 py-6 text-center text-muted">
                  No line items yet.
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="px-4 py-2.5 font-medium">{it.product}</td>
                <td className="px-4 py-2.5 text-muted">{it.description ?? "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{it.quantity}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(it.unitPrice, currency)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{it.vatPct}%</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatCurrency(lineTotal(it), currency)}</td>
                {editable && (
                  <td className="px-2 py-2.5 text-right">
                    <button
                      onClick={() => startTransition(() => deleteLineItem(proposalId, it.id))}
                      disabled={pending}
                      className="text-muted hover:text-alert p-1"
                      aria-label="Delete line item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2">
              <td colSpan={editable ? 5 : 4} />
              <td className="px-4 py-3 text-right text-muted text-xs">Total (incl. VAT)</td>
              <td className="px-4 py-3 text-right text-lg font-semibold" style={{ color: "#4D54F5" }}>
                {formatCurrency(grandTotal, currency)}
              </td>
              {editable && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {editable && (
        <div className="border-t p-4">
          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 text-sm text-indigo font-medium hover:underline"
            >
              <Plus className="w-4 h-4" /> Add line item
            </button>
          ) : (
            <form
              action={(fd) => {
                startTransition(async () => {
                  await addLineItem(proposalId, fd);
                  setAdding(false);
                });
              }}
              className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end"
            >
              <label className="text-xs col-span-2 md:col-span-1">
                Product
                <select name="product" className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm bg-card" defaultValue={PRODUCTS[0]}>
                  {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="text-xs col-span-2">
                Description
                <input name="description" className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm bg-card" />
              </label>
              <label className="text-xs">
                Qty
                <input name="quantity" type="number" step="0.5" defaultValue={1} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm bg-card" />
              </label>
              <label className="text-xs">
                Unit price
                <input name="unitPrice" type="number" step="100" defaultValue={0} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm bg-card" />
              </label>
              <label className="text-xs">
                VAT %
                <input name="vatPct" type="number" step="1" defaultValue={17} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm bg-card" />
              </label>
              <div className="col-span-2 md:col-span-6 flex gap-2">
                <button type="submit" disabled={pending} className="rounded-md bg-[var(--at-ink)] text-white px-3 py-1.5 text-sm">
                  {pending ? "Adding…" : "Add"}
                </button>
                <button type="button" onClick={() => setAdding(false)} className="rounded-md border px-3 py-1.5 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
