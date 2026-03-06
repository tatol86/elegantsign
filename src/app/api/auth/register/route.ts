import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { createCustomerSession, getCustomerSessionCookieOptions } from '@/lib/customer-auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const input = registerSchema.parse(await req.json());

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: hashPassword(input.password),
      },
    });

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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Invalid registration request.' }, { status: 400 });
  }
}
