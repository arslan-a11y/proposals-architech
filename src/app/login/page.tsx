import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-xl font-semibold">ArchiTech</div>
          <div className="text-[11px] text-muted">Think Deep. Implement Smart.</div>
        </div>
        <div className="rounded-[var(--radius-card)] border bg-card shadow-sm p-8">
          <h1 className="text-lg font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-muted mb-6">Access the proposal management system.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
