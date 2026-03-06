'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FulfillmentStatus, OrderStatus, PaymentStatus } from '@prisma/client';

type AdminOrderUpdateFormProps = {
  orderNumber: string;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
  currentFulfillmentStatus: FulfillmentStatus;
  currentShippingCarrier: string | null;
  currentTrackingNumber: string | null;
  currentInternalNotes: string | null;
};

export default function AdminOrderUpdateForm({
  orderNumber,
  currentStatus,
  currentPaymentStatus,
  currentFulfillmentStatus,
  currentShippingCarrier,
  currentTrackingNumber,
  currentInternalNotes,
}: AdminOrderUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(currentFulfillmentStatus);
  const [shippingCarrier, setShippingCarrier] = useState(currentShippingCarrier || '');
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || '');
  const [internalNotes, setInternalNotes] = useState(currentInternalNotes || '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          paymentStatus,
          fulfillmentStatus,
          shippingCarrier,
          trackingNumber,
          internalNotes,
          note,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Unable to update order.');
        return;
      }

      setMessage('Order updated.');
      setNote('');
      router.refresh();
    } catch {
      setError('Unable to update order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Update Order</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Change order, payment, and fulfillment states from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm text-neutral-400 block mb-2">Order Status</label>
          <select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white">
            {Object.values(OrderStatus).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-2">Payment Status</label>
          <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white">
            {Object.values(PaymentStatus).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-2">Fulfillment</label>
          <select value={fulfillmentStatus} onChange={(event) => setFulfillmentStatus(event.target.value as FulfillmentStatus)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white">
            {Object.values(FulfillmentStatus).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-neutral-400 block mb-2">Shipping Carrier</label>
        <input value={shippingCarrier} onChange={(event) => setShippingCarrier(event.target.value)} placeholder="Example: Australia Post" className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white" />
      </div>

      <div>
        <label className="text-sm text-neutral-400 block mb-2">Tracking Number</label>
        <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Example: LX123456789AU" className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white" />
      </div>

      <div>
        <label className="text-sm text-neutral-400 block mb-2">Internal Notes</label>
        <textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} className="min-h-[120px] w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white" />
      </div>

      <div>
        <label className="text-sm text-neutral-400 block mb-2">History Note</label>
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Example: Manual payment confirmed by phone" className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white" />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-green-400">{message}</p> : null}

      <button type="submit" disabled={submitting} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50">
        {submitting ? 'Saving...' : 'Save Order Changes'}
      </button>
    </form>
  );
}
