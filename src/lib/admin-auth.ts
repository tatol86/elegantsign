export const ADMIN_SESSION_COOKIE = 'admin_session';
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const ADMIN_ROLES = ['SUPER_ADMIN', 'OPS_MANAGER', 'CATALOG_MANAGER'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminSessionPayload = {
  userId: string;
  email: string;
  name: string | null;
  role: AdminRole;
};

type StoredAdminSession = AdminSessionPayload & {
  exp: number;
};

export type AdminPermission = 'dashboard' | 'catalog' | 'operations' | 'manage_admins';

function getAdminSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET');
  }

  return new TextEncoder().encode(secret);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodePayload(payload: StoredAdminSession): string {
  return bytesToBase64Url(textEncoder.encode(JSON.stringify(payload)));
}

function decodePayload(encodedPayload: string): StoredAdminSession | null {
  try {
    const json = textDecoder.decode(base64UrlToBytes(encodedPayload));
    const parsed = JSON.parse(json) as StoredAdminSession;

    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.exp !== 'number' ||
      !ADMIN_ROLES.includes(parsed.role)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function createHmacKey() {
  const secret = getAdminSecret();

  return crypto.subtle.importKey(
    'raw',
    toArrayBuffer(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export function getAdminBootstrapCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Primary Admin';

  if (!email || !password) {
    return null;
  }

  return { email, password, name };
}

export async function createAdminSessionToken(payload: AdminSessionPayload): Promise<string> {
  const storedPayload: StoredAdminSession = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = encodePayload(storedPayload);
  const key = await createHmacKey();
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    toArrayBuffer(textEncoder.encode(encodedPayload)),
  );

  return `${encodedPayload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const [encodedPayload, encodedSignature] = token.split('.');

    if (!encodedPayload || !encodedSignature) {
      return null;
    }

    const payload = decodePayload(encodedPayload);

    if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    const key = await createHmacKey();
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      toArrayBuffer(base64UrlToBytes(encodedSignature)),
      toArrayBuffer(textEncoder.encode(encodedPayload)),
    );

    if (!isValid) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function getAdminSessionCookieOptions() {
  return {
    name: ADMIN_SESSION_COOKIE,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission) {
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  if (role === 'OPS_MANAGER') {
    return permission === 'dashboard' || permission === 'operations';
  }

  if (role === 'CATALOG_MANAGER') {
    return permission === 'dashboard' || permission === 'catalog';
  }

  return false;
}

export function getAdminPermissionForPath(pathname: string): AdminPermission | null {
  if (
    pathname.startsWith('/admin/admins') ||
    pathname.startsWith('/api/admin/admins') ||
    pathname.startsWith('/admin/audit') ||
    pathname.startsWith('/api/admin/audit')
  ) {
    return 'manage_admins';
  }

  if (
    pathname.startsWith('/admin/products') ||
    pathname.startsWith('/api/admin/products') ||
    pathname.startsWith('/api/admin/upload')
  ) {
    return 'catalog';
  }

  if (
    pathname.startsWith('/admin/orders') ||
    pathname.startsWith('/admin/payments') ||
    pathname.startsWith('/admin/fulfillment') ||
    pathname.startsWith('/admin/customers') ||
    pathname.startsWith('/api/admin/orders') ||
    pathname.startsWith('/api/admin/payments')
  ) {
    return 'operations';
  }

  return 'dashboard';
}
