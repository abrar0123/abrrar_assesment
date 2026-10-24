import { Movie, Paged } from '@/src/api/tmdb';

type Handler = (params: URLSearchParams) => unknown;

// Minimal fake TMDb: register JSON responses per path, inspect which requests were made.
export function createTmdbServer() {
  const routes = new Map<string, Handler>();
  let offline = false;
  let stalled = false;
  const requests: { path: string; params: URLSearchParams }[] = [];

  const fetchMock = jest.fn(async (input: string, init?: { signal?: AbortSignal }) => {
    const url = new URL(input);
    const path = url.pathname.replace(/^\/3/, '');
    requests.push({ path, params: url.searchParams });
    if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (offline) throw new TypeError('Network request failed');
    if (stalled) {
      // Like a phone with no signal: the request hangs until it is aborted.
      return new Promise<never>((_, reject) =>
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
      );
    }
    const handler = routes.get(path);
    if (!handler) {
      return { ok: false, status: 404, json: async () => ({ status_message: `No route for ${path}` }) };
    }
    const body = handler(url.searchParams);
    return { ok: true, status: 200, json: async () => body };
  });

  return {
    fetchMock,
    on: (path: string, handler: Handler) => routes.set(path, handler),
    fail: (path: string, status: number, message: string) =>
      routes.set(path, () => {
        throw Object.assign(new Error(message), { status });
      }),
    setOffline: (value: boolean) => {
      offline = value;
    },
    setStalled: (value: boolean) => {
      stalled = value;
    },
    requestsTo: (path: string) => requests.filter((r) => r.path === path),
    reset: () => {
      routes.clear();
      requests.length = 0;
      offline = false;
      stalled = false;
      fetchMock.mockClear();
    },
    install: () => {
      global.fetch = fetchMock as unknown as typeof fetch;
    },
  };
}

export const movie = (id: number, title: string, overrides: Partial<Movie> = {}): Movie => ({
  id,
  title,
  overview: `${title} overview`,
  poster_path: `/poster-${id}.jpg`,
  backdrop_path: `/backdrop-${id}.jpg`,
  release_date: '2026-12-01',
  genre_ids: [28],
  ...overrides,
});

export const page = (results: Movie[], pageNumber = 1, totalPages = 1): Paged<Movie> => ({
  page: pageNumber,
  results,
  total_pages: totalPages,
  total_results: results.length * totalPages,
});
