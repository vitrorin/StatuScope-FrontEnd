import { firebaseAuth } from '@/lib/firebase';
import { getCurrentLanguage } from '@/i18n/language';
import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export function acceptAnyHttpStatus() {
  return true;
}

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

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: acceptAnyHttpStatus,
});

apiClient.interceptors.request.use(async (config) => {
  const headers = AxiosHeaders.from(config.headers);
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
  headers.set('Accept-Language', getCurrentLanguage());

  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  config.headers = headers;
  return config;
});

function parseBody(body: BodyInit | null | undefined): AxiosRequestConfig['data'] {
  if (typeof body !== 'string') {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await apiClient.request({
    url: path,
    method: init.method,
    headers: init.headers as AxiosRequestConfig['headers'],
    data: parseBody(init.body),
  });

  if (response.status === 204) return undefined as T;

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) {
      await firebaseAuth.signOut().catch(() => undefined);
    }
    const body = response.data ?? {};
    const code = (body as { code?: string }).code;
    const message = (body as { message?: string }).message ?? response.statusText;
    throw new ApiError(response.status, code, message);
  }

  return response.data as T;
}
