import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCustomerSession, getCustomerSessionCookieOptions } from '@/lib/customer-auth';
import { verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const input = loginSchema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: {
        email: input.email.toLowerCase(),
      },
    });

    if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const session = await createCustomerSession(user.id);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set({
      ...getCustomerSessionCookieOptions(),
      value: session.token,
      expires: session.expires,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid login request.' }, { status: 400 });
  }
}
