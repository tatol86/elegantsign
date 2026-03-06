import { NextRequest, NextResponse } from 'next/server';
import { logAdminAudit } from '@/lib/admin-audit';
import { requireAdminRequest } from '@/lib/admin-route';
import { uploadProductImage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req, 'catalog');

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const uploaded = await uploadProductImage(file);

    await logAdminAudit({
      actorUserId: admin.userId,
      action: 'PRODUCT_MEDIA_UPLOADED',
      entityType: 'media_asset',
      entityId: uploaded.pathname,
      summary: `Uploaded product media ${file.name}.`,
      metadata: {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        storage: uploaded.storage,
        url: uploaded.url,
      },
    });

    return NextResponse.json({
      success: true,
      path: uploaded.url,
      filename: uploaded.pathname,
      storage: uploaded.storage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    console.error('Upload error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
