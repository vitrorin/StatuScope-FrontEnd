import { firebaseAuth } from './firebase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  code: string | undefined;
  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const user = firebaseAuth.currentUser;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (user) {
    const token = await user.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({} as Record<string, unknown>));

  if (!res.ok) {
    if (res.status === 401) {
      await firebaseAuth.signOut().catch(() => undefined);
    }
    const code = (body as { code?: string }).code;
    const message = (body as { message?: string }).message ?? res.statusText;
    throw new ApiError(res.status, code, message);
  }

  return body as T;
}
