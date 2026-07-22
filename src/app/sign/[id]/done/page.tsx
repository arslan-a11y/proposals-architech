import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function SignedDonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-[var(--radius-card)] border bg-card shadow-sm p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[#E3F9EC] flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h1 className="text-xl font-semibold">Thank you — signature received</h1>
        <p className="mt-2 text-sm text-muted">
          Your signed proposal has been recorded and our team has been notified. We’ll be in touch
          shortly to begin onboarding.
        </p>
        <Link
          href={`/sign/${id}`}
          className="inline-block mt-6 text-sm text-indigo hover:underline"
        >
          View the signed proposal
        </Link>
      </div>
    </div>
  );
}
