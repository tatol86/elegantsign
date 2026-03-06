'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MOCK_PAYMENT_OPTIONS, type MockPaymentOutcome } from '@/lib/mock-payment';

type MockPaymentActionsProps = {
  orderNumber: string;
  isPaid: boolean;
};

export default function MockPaymentActions({
  orderNumber,
  isPaid,
}: MockPaymentActionsProps) {
  const router = useRouter();
  const [submittingOutcome, setSubmittingOutcome] = useState<MockPaymentOutcome | null>(null);
  const [error, setError] = useState('');

  const handleMockPayment = async (outcome: MockPaymentOutcome) => {
    setSubmittingOutcome(outcome);
    setError('');

    try {
      const response = await fetch(`/api/orders/${orderNumber}/payments/mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outcome }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Unable to process test payment.');
        return;
      }

      router.push(`/order/${orderNumber}`);
      router.refresh();
    } catch {
      setError('Unable to process test payment.');
    } finally {
      setSubmittingOutcome(null);
    }
  };

  if (isPaid) {
    return (
      <div className="rounded-3xl border bg-green-50 p-6 space-y-4">
        <p className="text-sm font-medium text-green-800">
          This order is already marked as paid.
        </p>
        <Button onClick={() => router.push(`/order/${orderNumber}`)} className="w-full">
          View Order
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(MOCK_PAYMENT_OPTIONS).map(([outcome, option]) => (
        <button
          key={outcome}
          type="button"
          onClick={() => handleMockPayment(outcome as MockPaymentOutcome)}
          disabled={submittingOutcome !== null}
          className="w-full rounded-3xl border bg-white p-5 text-left transition-colors hover:border-black disabled:opacity-60"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{option.label}</p>
              <p className="text-sm text-neutral-500 mt-1">{option.description}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              {submittingOutcome === outcome ? 'Processing' : 'Run'}
            </span>
          </div>
        </button>
      ))}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
