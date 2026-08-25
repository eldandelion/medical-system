/**
 * Centralized API client utility with automatic base URL normalization,
 * header composition, query string serialization, and defensive response parsing.
 */

export function apiUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${cleanBase}${cleanPath}`.replace(/\/\/+/g, '/').replace(':/', '://');

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  return url;
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
}

export async function apiFetch<T = unknown>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, params, headers, body, ...rest } = options;

  const url = apiUrl(endpoint, params);

  const isJsonBody = body !== undefined && !(body instanceof FormData) && !(body instanceof Blob);
  const formattedBody = isJsonBody ? JSON.stringify(body) : (body as BodyInit | null | undefined);

  const response = await fetch(url, {
    ...rest,
    body: formattedBody,
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status || 500} ${response.statusText || 'Error'}`;
    try {
      const errorBody = typeof response.json === 'function' ? await response.json() : null;
      if (errorBody && typeof errorBody === 'object') {
        errorMessage = (errorBody as any).error || (errorBody as any).message || errorMessage;
      }
    } catch {
      // Fallback if response body is HTML or empty
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content or empty responses
  if (response.status === 204 || response.headers?.get?.('content-length') === '0') {
    return undefined as unknown as T;
  }

  return (typeof response.json === 'function' ? await response.json() : response) as T;
}
