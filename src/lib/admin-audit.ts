import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type AdminAuditInput = {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue | null;
};

export async function logAdminAudit(input: AdminAuditInput) {
  return prisma.adminAuditLog.create({
    data: {
      actorUserId: input.actorUserId || null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || null,
      summary: input.summary,
      metadata:
        input.metadata === undefined
          ? undefined
          : input.metadata === null
            ? Prisma.JsonNull
            : input.metadata,
    },
  });
}
