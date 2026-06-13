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

export const apiClient = {
  interceptors: {
    request: { use: () => undefined },
  },
  request: async () => ({ status: 200, data: {} }),
};

export async function api<T = unknown>(): Promise<T> {
  return {} as T;
}
