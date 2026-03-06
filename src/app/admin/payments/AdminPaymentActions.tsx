'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PaymentActionProps = {
  paymentId: string;
  paymentStatus: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED';
  canViewAudit: boolean;
};

export default function AdminPaymentActions({
  paymentId,
  paymentStatus,
  canViewAudit,
}: PaymentActionProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const runAction = async (
    nextStatus: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED',
    label: string,
  ) => {
    const note = window.prompt(`Optional note for "${label}"`, '');

    if (note === null) {
      return;
    }

    setSubmitting(nextStatus);
    setError('');

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: nextStatus,
          note: note || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Unable to update payment.');
        setSubmitting(null);
        return;
      }

      router.refresh();
    } catch {
      setError('Unable to update payment.');
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting !== null || paymentStatus === 'PAID'}
          onClick={() => runAction('PAID', 'Mark Paid')}
          className="rounded-lg bg-green-500/15 px-3 py-2 text-xs font-semibold text-green-200 transition-colors hover:bg-green-500/25 disabled:opacity-50"
        >
          {submitting === 'PAID' ? 'Saving...' : 'Mark Paid'}
        </button>
        <button
          type="button"
          disabled={submitting !== null || paymentStatus === 'FAILED'}
          onClick={() => runAction('FAILED', 'Mark Failed')}
          className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/25 disabled:opacity-50"
        >
          {submitting === 'FAILED' ? 'Saving...' : 'Mark Failed'}
        </button>
        <button
          type="button"
          disabled={submitting !== null || paymentStatus === 'REFUNDED'}
          onClick={() => runAction('REFUNDED', 'Mark Refunded')}
          className="rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
        >
          {submitting === 'REFUNDED' ? 'Saving...' : 'Refund'}
        </button>
        {canViewAudit ? (
          <Link
            href={`/admin/audit?entityType=payment&q=${encodeURIComponent(paymentId)}`}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:bg-neutral-900"
          >
            Audit
          </Link>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
