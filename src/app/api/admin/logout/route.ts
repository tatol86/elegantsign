import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionCookieOptions, ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin-audit';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const admin = token ? await verifyAdminSessionToken(token) : null;
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    ...getAdminSessionCookieOptions(),
    value: '',
    maxAge: 0,
  });

  if (admin) {
    await logAdminAudit({
      actorUserId: admin.userId,
      action: 'ADMIN_LOGOUT',
      entityType: 'admin_user',
      entityId: admin.userId,
      summary: `Admin logout for ${admin.email}.`,
      metadata: {
        email: admin.email,
        adminRole: admin.role,
      },
    });
  }

  return response;
}
