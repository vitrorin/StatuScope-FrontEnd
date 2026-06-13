import '@testing-library/jest-native/extend-expect';
import type React from 'react';

(expect as any).extend({
  toHaveBeenCalledOnce(received: jest.Mock) {
    const pass = received.mock.calls.length === 1;
    return {
      pass,
      message: () => `expected mock to be called once, received ${received.mock.calls.length} calls`,
    };
  },
});

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('axios', () => {
  class MockAxiosHeaders {
    private values = new Map<string, string>();

    constructor(initial?: Record<string, unknown>) {
      Object.entries(initial ?? {}).forEach(([key, value]) => {
        if (value != null) {
          this.set(key, String(value));
        }
      });
    }

    static from(headers?: unknown) {
      if (headers instanceof MockAxiosHeaders) return headers;
      if (headers instanceof Headers) {
        const record: Record<string, string> = {};
        headers.forEach((value, key) => {
          record[key] = value;
        });
        return new MockAxiosHeaders(record);
      }
      return new MockAxiosHeaders(headers as Record<string, unknown>);
    }

    set(key: string, value: unknown) {
      this.values.set(key.toLowerCase(), String(value));
    }

    get(key: string) {
      return this.values.get(key.toLowerCase()) ?? null;
    }

    toJSON() {
      return Object.fromEntries(this.values);
    }
  }

  type MockRequestConfig = {
    url?: string;
    method?: string;
    headers?: Record<string, unknown> | Headers;
    data?: unknown;
  };

  function create(defaultConfig: { baseURL?: string; headers?: Record<string, unknown> } = {}) {
    const requestHandlers: Array<(config: MockRequestConfig) => Promise<MockRequestConfig> | MockRequestConfig> = [];

    return {
      interceptors: {
        request: {
          use(handler: (config: MockRequestConfig) => Promise<MockRequestConfig> | MockRequestConfig) {
            requestHandlers.push(handler);
          },
        },
      },
      async request(config: MockRequestConfig) {
        let nextConfig: MockRequestConfig = {
          ...config,
          headers: {
            ...(defaultConfig.headers ?? {}),
            ...((config.headers as Record<string, unknown>) ?? {}),
          },
        };

        for (const handler of requestHandlers) {
          nextConfig = await handler(nextConfig);
        }

        const url = `${defaultConfig.baseURL ?? ''}${nextConfig.url ?? ''}`;
        const headers = MockAxiosHeaders.from(nextConfig.headers).toJSON();
        const init: RequestInit = {
          method: nextConfig.method as string | undefined,
          headers: new Headers(headers),
        };

        if (nextConfig.data !== undefined) {
          init.body = typeof nextConfig.data === 'string'
            ? nextConfig.data
            : JSON.stringify(nextConfig.data);
        }

        const response = await globalThis.fetch(url, init);
        const data = response.status === 204
          ? undefined
          : await response.json().catch(() => undefined);

        return {
          status: response.status,
          statusText: response.statusText,
          data,
          headers: response.headers,
        };
      },
    };
  }

  return {
    __esModule: true,
    default: { create },
    AxiosHeaders: MockAxiosHeaders,
  };
});

jest.mock('expo-router', () => ({
  Stack: Object.assign(({ children }: { children: React.ReactNode }) => children, {
    Screen: () => null,
  }),
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  Redirect: () => null,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
