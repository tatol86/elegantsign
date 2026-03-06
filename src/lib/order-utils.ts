import { prisma } from '@/lib/prisma';

export function formatMoneyFromCents(amount: number): number {
  return Number((amount / 100).toFixed(2));
}

export function formatOrderStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getPaymentStatusTone(paymentStatus: string) {
  switch (paymentStatus) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'AUTHORIZED':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-neutral-200 text-neutral-700';
  }
}

export function generateOrderNumber() {
  const date = new Date();
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate(),
  ).padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `ES-${yyyymmdd}-${randomPart}`;
}

export async function generateUniqueOrderNumber() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = generateOrderNumber();
    const existing = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return orderNumber;
    }
  }

  throw new Error('Failed to generate unique order number');
}
