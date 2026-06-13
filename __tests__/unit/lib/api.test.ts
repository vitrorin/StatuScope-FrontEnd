import { describe, expect, it, vi, afterEach } from '@/__tests__/helpers/jestCompat';
import { acceptAnyHttpStatus, api, apiClient, ApiError } from '@/lib/api';
import { firebaseAuth } from '@/lib/firebase';

describe('api helper', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses JSON request bodies before passing them to axios', async () => {
    const requestSpy = vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      status: 200,
      data: { ok: true },
    });

    const result = await api('/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ana' }),
    });

    expect(result).toEqual({ ok: true });
    expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({
      url: '/test',
      method: 'POST',
      data: { name: 'Ana' },
    }));
  });

  it('keeps axios responses available for the helper to classify', () => {
    expect(acceptAnyHttpStatus()).toBe(true);
  });

  it('keeps plain text bodies when they are not valid JSON', async () => {
    const requestSpy = vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      status: 200,
      data: { ok: true },
    });

    await api('/plain', { method: 'POST', body: 'plain text' });

    expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({
      data: 'plain text',
    }));
  });

  it('returns undefined for 204 responses', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      status: 204,
      data: null,
    });

    await expect(api('/empty')).resolves.toBeUndefined();
  });

  it('signs out and throws ApiError for 401 responses', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      status: 401,
      statusText: 'Unauthorized',
      data: { code: 'AUTH', message: 'Session expired' },
    });

    await expect(api('/secure')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'AUTH',
      message: 'Session expired',
    } satisfies Partial<ApiError>);
    expect(firebaseAuth.signOut).toHaveBeenCalled();
  });
});
