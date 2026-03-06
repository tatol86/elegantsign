import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin-audit';
import { requireAdminRequest } from '@/lib/admin-route';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

const updateAdminSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  adminRole: z.enum(['SUPER_ADMIN', 'OPS_MANAGER', 'CATALOG_MANAGER']),
  isActive: z.boolean(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const currentAdmin = await requireAdminRequest(req, 'manage_admins');

  if (currentAdmin instanceof NextResponse) {
    return currentAdmin;
  }

  try {
    const input = updateAdminSchema.parse(await req.json());
    const targetAdmin = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        adminRole: true,
        isActive: true,
      },
    });

    if (!targetAdmin || !targetAdmin.adminRole) {
      return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
    }

    if (currentAdmin.userId === targetAdmin.id && (!input.isActive || input.adminRole !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'You cannot remove or demote your own super admin access.' }, { status: 400 });
    }

    if (targetAdmin.adminRole === 'SUPER_ADMIN' && (!input.isActive || input.adminRole !== 'SUPER_ADMIN')) {
      const superAdminCount = await prisma.user.count({
        where: {
          role: 'ADMIN',
          adminRole: 'SUPER_ADMIN',
          isActive: true,
        },
      });

      if (superAdminCount <= 1) {
        return NextResponse.json({ error: 'At least one active super admin is required.' }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        name: input.name,
        email: input.email,
        adminRole: input.adminRole,
        isActive: input.isActive,
        passwordHash: input.newPassword ? hashPassword(input.newPassword) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        adminRole: true,
        isActive: true,
      },
    });

    await logAdminAudit({
      actorUserId: currentAdmin.userId,
      action: 'ADMIN_UPDATED',
      entityType: 'admin_user',
      entityId: updated.id,
      summary: `Updated admin ${updated.email}.`,
      metadata: {
        targetAdminId: updated.id,
        before: {
          email: targetAdmin.email,
          name: targetAdmin.name,
          adminRole: targetAdmin.adminRole,
          isActive: targetAdmin.isActive,
        },
        after: {
          email: updated.email,
          name: updated.name,
          adminRole: updated.adminRole,
          isActive: updated.isActive,
          passwordReset: Boolean(input.newPassword),
        },
      },
    });

    const response = NextResponse.json({ success: true, admin: updated });

    if (currentAdmin.userId === updated.id) {
      const token = await createAdminSessionToken({
        userId: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.adminRole!,
      });

      response.cookies.set({
        ...getAdminSessionCookieOptions(),
        value: token,
      });
    }

    return response;
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid admin update payload.' },
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

    return NextResponse.json({ error: 'Unable to update admin.' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const currentAdmin = await requireAdminRequest(req, 'manage_admins');

  if (currentAdmin instanceof NextResponse) {
    return currentAdmin;
  }

  try {
    const targetAdmin = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        adminRole: true,
        isActive: true,
      },
    });

    if (!targetAdmin || !targetAdmin.adminRole) {
      return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
    }

    if (currentAdmin.userId === targetAdmin.id) {
      return NextResponse.json(
        { error: 'You cannot delete the admin account currently signed in.' },
        { status: 400 },
      );
    }

    if (targetAdmin.adminRole === 'SUPER_ADMIN' && targetAdmin.isActive) {
      const superAdminCount = await prisma.user.count({
        where: {
          role: 'ADMIN',
          adminRole: 'SUPER_ADMIN',
          isActive: true,
        },
      });

      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'At least one active super admin is required.' },
          { status: 400 },
        );
      }
    }

    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    await logAdminAudit({
      actorUserId: currentAdmin.userId,
      action: 'ADMIN_DELETED',
      entityType: 'admin_user',
      entityId: targetAdmin.id,
      summary: `Deleted admin ${targetAdmin.email}.`,
      metadata: {
        deletedAdminId: targetAdmin.id,
        email: targetAdmin.email,
        name: targetAdmin.name,
        adminRole: targetAdmin.adminRole,
        isActive: targetAdmin.isActive,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to delete admin.' }, { status: 400 });
  }
}
