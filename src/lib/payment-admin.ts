import { OrderStatus, PaymentStatus } from '@prisma/client';

export function getOrderStatusFromPaymentStatus(
  currentOrderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
) {
  switch (paymentStatus) {
    case 'PAID':
      if (currentOrderStatus === 'PENDING' || currentOrderStatus === 'DRAFT') {
        return 'CONFIRMED';
      }
      return currentOrderStatus;
    case 'FAILED':
      if (
        currentOrderStatus === 'PENDING' ||
        currentOrderStatus === 'DRAFT' ||
        currentOrderStatus === 'CONFIRMED'
      ) {
        return 'PENDING';
      }
      return currentOrderStatus;
    case 'REFUNDED':
      return 'REFUNDED';
    case 'AUTHORIZED':
    case 'PENDING':
    default:
      return currentOrderStatus === 'DRAFT' ? 'PENDING' : currentOrderStatus;
  }
}

export function getPaymentTimestampPatch(
  paymentStatus: PaymentStatus,
): {
  paidAt: Date | null;
  failedAt: Date | null;
} {
  if (paymentStatus === 'PAID') {
    return {
      paidAt: new Date(),
      failedAt: null,
    };
  }

  if (paymentStatus === 'FAILED') {
    return {
      paidAt: null,
      failedAt: new Date(),
    };
  }

  return {
    paidAt: null,
    failedAt: null,
  };
}
