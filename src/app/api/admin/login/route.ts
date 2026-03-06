import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createAdminSessionToken,
  getAdminBootstrapCredentials,
  getAdminSessionCookieOptions,
} from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin-audit';
import { hashPassword, verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { email, password } = loginSchema.parse(await req.json());
    let admin = await prisma.user.findFirst({
      where: {
        email,
        role: 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        adminRole: true,
      },
    });

    if (!admin) {
      const bootstrap = getAdminBootstrapCredentials();
      const adminCount = await prisma.user.count({
        where: {
          role: 'ADMIN',
        },
      });

      if (
        adminCount > 0 ||
        !bootstrap ||
        bootstrap.email !== email ||
        bootstrap.password !== password
      ) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }

      admin = await prisma.user.create({
        data: {
          email: bootstrap.email,
          name: bootstrap.name,
          role: 'ADMIN',
          adminRole: 'SUPER_ADMIN',
          isActive: true,
          passwordHash: hashPassword(bootstrap.password),
        },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
          adminRole: true,
        },
      });
    }

    if (!admin.passwordHash || !admin.adminRole || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await createAdminSessionToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.adminRole,
    });
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      ...getAdminSessionCookieOptions(),
      value: token,
    });

    await logAdminAudit({
      actorUserId: admin.id,
      action: 'ADMIN_LOGIN',
      entityType: 'admin_user',
      entityId: admin.id,
      summary: `Admin login for ${admin.email}.`,
      metadata: {
        email: admin.email,
        adminRole: admin.adminRole,
      },
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid login payload.' }, { status: 400 });
  }
}
