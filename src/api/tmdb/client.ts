import { env } from '@/src/config/env';

// Accepts either a v3 API key (sent as `api_key`) or a v4 read access token (sent as Bearer).
const BASE_URL = 'https://api.themoviedb.org/3';
const IS_BEARER = env.tmdbApiKey.startsWith('eyJ');

export type QueryParams = Record<string, string | number>;

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

export async function tmdbGet<T>(path: string, params: QueryParams = {}, signal?: AbortSignal): Promise<T> {
  if (!env.tmdbApiKey) {
    throw new TmdbError('Missing TMDb API key. Set EXPO_PUBLIC_TMDB_API_KEY in your .env file.');
  }

  const query = new URLSearchParams({ language: 'en-US' });
  Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
  if (!IS_BEARER) query.set('api_key', env.tmdbApiKey);

  const res = await fetch(`${BASE_URL}${path}?${query.toString()}`, {
    signal,
    headers: {
      accept: 'application/json',
      ...(IS_BEARER ? { Authorization: `Bearer ${env.tmdbApiKey}` } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new TmdbError(body?.status_message ?? `Request failed (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}
