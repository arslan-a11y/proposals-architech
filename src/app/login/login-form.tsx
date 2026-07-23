"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "@/lib/auth-actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  const next = useSearchParams().get("next") || "/";

  const field = "mt-1 w-full rounded-lg border px-3 py-2.5 text-sm bg-white";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" autoComplete="email" required className={field} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={field} />
      </label>

      {state.error && (
        <div className="rounded-lg bg-[#FEE4E4] text-[#B91C1C] text-sm px-3 py-2">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[var(--at-ink)] text-white py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
