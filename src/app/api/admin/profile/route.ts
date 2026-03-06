import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin-audit';
import { requireAdminRequest } from '@/lib/admin-route';
import { hashPassword, verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminRequest(req, 'dashboard');

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const input = updateProfileSchema.parse(await req.json());
    const existing = await prisma.user.findUnique({
      where: {
        id: admin.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!existing?.passwordHash || !verifyPassword(input.currentPassword, existing.passwordHash)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: {
        id: admin.userId,
      },
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.newPassword ? hashPassword(input.newPassword) : undefined,
      },
      select: {
        name: true,
        email: true,
        adminRole: true,
      },
    });

    const token = await createAdminSessionToken({
      userId: admin.userId,
      email: updated.email,
      name: updated.name,
      role: updated.adminRole || admin.role,
    });
    const response = NextResponse.json({ success: true, admin: updated });
    response.cookies.set({
      ...getAdminSessionCookieOptions(),
      value: token,
    });

    await logAdminAudit({
      actorUserId: admin.userId,
      action: 'ADMIN_PROFILE_UPDATED',
      entityType: 'admin_user',
      entityId: admin.userId,
      summary: `Updated own admin profile ${updated.email}.`,
      metadata: {
        before: {
          name: existing.name,
          email: existing.email,
        },
        after: {
          name: updated.name,
          email: updated.email,
          passwordChanged: Boolean(input.newPassword),
        },
      },
    });

    return response;
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid profile update payload.' },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'That email is already in use.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Unable to update profile.' }, { status: 400 });
  }
}
