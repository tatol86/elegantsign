import { NextRequest, NextResponse } from 'next/server';
import {
  CUSTOMER_SESSION_COOKIE,
  deleteCustomerSession,
  getCustomerSessionCookieOptions,
} from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (sessionToken) {
    await deleteCustomerSession(sessionToken);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    ...getCustomerSessionCookieOptions(),
    value: '',
    maxAge: 0,
  });

  return response;
}
