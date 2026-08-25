import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiUrl, apiFetch } from './client';

describe('client utility', () => {
  describe('apiUrl', () => {
    it('constructs correct URL with base path and leading slash', () => {
      const url = apiUrl('/api/students');
      expect(url).toBe(`${import.meta.env.BASE_URL || '/'}api/students`.replace(/\/\/+/g, '/'));
    });

    it('constructs correct URL when path lacks leading slash', () => {
      const url = apiUrl('api/students');
      expect(url).toBe(`${import.meta.env.BASE_URL || '/'}api/students`.replace(/\/\/+/g, '/'));
    });

    it('appends and encodes query parameters', () => {
      const url = apiUrl('/api/admin/users', { role: 'TEACHER', page: 1, filter: 'active user' });
      expect(url).toContain('role=TEACHER');
      expect(url).toContain('page=1');
      expect(url).toContain('filter=active+user');
    });

    it('omits undefined, null, and empty string query parameters', () => {
      const url = apiUrl('/api/admin/users', { role: 'TEACHER', empty: '', nullVal: null, undefVal: undefined });
      expect(url).toContain('role=TEACHER');
      expect(url).not.toContain('empty');
      expect(url).not.toContain('nullVal');
      expect(url).not.toContain('undefVal');
    });
  });

  describe('apiFetch', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('attaches Authorization header when token is supplied', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true }),
      });

      const data = await apiFetch<{ success: boolean }>('/api/test', {
        token: 'test_secret_token_123',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_secret_token_123',
          }),
        })
      );
      expect(data).toEqual({ success: true });
    });

    it('automatically stringifies object body with Content-Type application/json', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: '123' }),
      });

      await apiFetch<{ id: string }>('/api/students', {
        method: 'POST',
        body: { name: 'Student Zhang' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/students'),
        expect.objectContaining({
          body: JSON.stringify({ name: 'Student Zhang' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('handles 204 No Content gracefully without parsing JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      const res = await apiFetch<void>('/api/students/1', { method: 'DELETE' });
      expect(res).toBeUndefined();
    });

    it('throws error with structured backend error message on 400', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Invalid Student ID Number' }),
      });

      await expect(apiFetch('/api/students')).rejects.toThrow('Invalid Student ID Number');
    });

    it('falls back to statusText on non-JSON 502 error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: new Headers({ 'content-type': 'text/html' }),
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON at position 0');
        },
      });

      await expect(apiFetch('/api/students')).rejects.toThrow('HTTP 502 Bad Gateway');
    });
  });
});
