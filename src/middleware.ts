import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
    ADMIN_SESSION_COOKIE,
    getAdminPermissionForPath,
    hasAdminPermission,
    verifyAdminSessionToken,
} from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const permission = getAdminPermissionForPath(pathname);

    if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
        const session = token ? await verifyAdminSessionToken(token) : null;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (permission && !hasAdminPermission(session.role, permission)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const session = token ? await verifyAdminSessionToken(token) : null;

        if (!session) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }

        if (permission && !hasAdminPermission(session.role, permission)) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
