export const MOCK_PAYMENT_OPTIONS = {
  success: {
    label: 'Mock Card Approved',
    description: 'Marks the order as paid and confirms it for production.',
    method: 'MOCK_CARD',
    paymentStatus: 'PAID',
    orderStatus: 'CONFIRMED',
    note: 'Mock card payment approved.',
  },
  failed: {
    label: 'Mock Card Declined',
    description: 'Records a failed attempt and keeps the order awaiting payment.',
    method: 'MOCK_CARD',
    paymentStatus: 'FAILED',
    orderStatus: 'PENDING',
    note: 'Mock card payment declined.',
  },
  bank_transfer: {
    label: 'Bank Transfer Pending',
    description: 'Records an offline payment attempt that is still awaiting funds.',
    method: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    orderStatus: 'PENDING',
    note: 'Waiting for mock bank transfer confirmation.',
  },
} as const;

export type MockPaymentOutcome = keyof typeof MOCK_PAYMENT_OPTIONS;
