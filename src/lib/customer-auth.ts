import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const CUSTOMER_SESSION_COOKIE = 'customer_session';
const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type CustomerSessionUser = {
  id: string;
  email: string;
  name: string | null;
};

export function getCustomerSessionCookieOptions() {
  return {
    name: CUSTOMER_SESSION_COOKIE,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
  };
}

function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export async function createCustomerSession(userId: string) {
  const token = createSessionToken();
  const expires = new Date(Date.now() + CUSTOMER_SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expires,
    },
  });

  return { token, expires };
}

export async function deleteCustomerSession(sessionToken: string) {
  await prisma.session.deleteMany({
    where: {
      sessionToken,
    },
  });
}

export async function getCurrentCustomer(): Promise<CustomerSessionUser | null> {
  const sessionToken = cookies().get(CUSTOMER_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expires < new Date()) {
    await deleteCustomerSession(sessionToken);
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

export async function requireCustomer() {
  const customer = await getCurrentCustomer();
  return customer;
}
