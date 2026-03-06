import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { logAdminAudit } from '@/lib/admin-audit';
import { requireAdminRequest } from '@/lib/admin-route';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

const createAdminSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8),
  adminRole: z.enum(['SUPER_ADMIN', 'OPS_MANAGER', 'CATALOG_MANAGER']),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req, 'manage_admins');

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const input = createAdminSchema.parse(await req.json());
    const created = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: hashPassword(input.password),
        role: 'ADMIN',
        adminRole: input.adminRole,
        isActive: true,
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
      actorUserId: admin.userId,
      action: 'ADMIN_CREATED',
      entityType: 'admin_user',
      entityId: created.id,
      summary: `Created admin ${created.email}.`,
      metadata: {
        createdAdminId: created.id,
        email: created.email,
        name: created.name,
        adminRole: created.adminRole,
      },
    });

    return NextResponse.json({ success: true, admin: created }, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid admin payload.' },
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

    return NextResponse.json({ error: 'Unable to create admin.' }, { status: 400 });
  }
}
