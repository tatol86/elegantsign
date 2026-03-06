import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/admin-route';

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req, 'dashboard');

  if (admin instanceof NextResponse) {
    return admin;
  }

  return NextResponse.json({
    admin: {
      userId: admin.userId,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}
