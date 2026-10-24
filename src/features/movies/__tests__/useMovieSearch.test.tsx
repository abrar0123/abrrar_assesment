import { act, renderHook, waitFor } from '@testing-library/react-native';
import { SEARCH_DEBOUNCE_MS, useMovieSearch } from '../hooks/useMovieSearch';
import { createTmdbServer, movie, page } from '@/src/test/tmdbServer';
import { createTestQueryClient, createWrapper, setOnline } from '@/src/test/render';

const server = createTmdbServer();

beforeEach(() => {
  jest.useFakeTimers();
  server.install();
  server.reset();
  act(() => setOnline(true));
  server.on('/search/movie', (params) =>
    page([movie(1, `${params.get('query')} One`), movie(2, `${params.get('query')} Two`)]),
  );
});

afterEach(() => jest.useRealTimers());

function setup(client = createTestQueryClient()) {
  return renderHook(() => useMovieSearch(), { wrapper: createWrapper(client) });
}

const typeQuery = (result: { current: ReturnType<typeof useMovieSearch> }, text: string) => {
  for (let i = 1; i <= text.length; i++) {
    act(() => result.current.setQuery(text.slice(0, i)));
    act(() => jest.advanceTimersByTime(100)); // typing faster than the debounce window
  }
};

describe('useMovieSearch', () => {
  it('sends one request after the user stops typing, not one per keystroke', async () => {
    const { result } = setup();

    typeQuery(result, 'Tim');
    expect(server.requestsTo('/search/movie')).toHaveLength(0);
    expect(result.current.isSearching).toBe(true);

    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    await waitFor(() => expect(result.current.results.map((m) => m.title)).toEqual(['Tim One', 'Tim Two']));
    const requests = server.requestsTo('/search/movie');
    expect(requests).toHaveLength(1);
    expect(requests[0].params.get('query')).toBe('Tim');
    expect(result.current.isSearching).toBe(false);
  });

  it('answers a repeated query from the cache without another request', async () => {
    const { result } = setup();

    act(() => result.current.setQuery('Dune'));
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    await waitFor(() => expect(result.current.results).toHaveLength(2));

    act(() => result.current.setQuery(''));
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    act(() => result.current.setQuery('dune')); // case-insensitive cache key
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    await waitFor(() => expect(result.current.results[0].title).toBe('Dune One'));
    expect(server.requestsTo('/search/movie')).toHaveLength(1);
  });

  it('still shows earlier results offline, and says so when there is nothing saved', async () => {
    const client = createTestQueryClient();
    const { result } = setup(client);

    act(() => result.current.setQuery('Alien'));
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    await waitFor(() => expect(result.current.results).toHaveLength(2));

    act(() => setOnline(false));
    server.setOffline(true);

    act(() => result.current.setQuery('Never searched'));
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    await waitFor(() => expect(result.current.error).toMatch(/offline/i));
    expect(result.current.results).toEqual([]);

    act(() => result.current.setQuery('Alien'));
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    await waitFor(() => expect(result.current.results[0].title).toBe('Alien One'));
  });

  it('never shows the previous query’s results under a new query that is waiting for a connection', async () => {
    // With retries on (as in the app), React Query pauses an offline fetch instead of failing it.
    const { result } = setup(createTestQueryClient({ retry: 2 }));

    act(() => result.current.setQuery('Alien'));
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    await waitFor(() => expect(result.current.results).toHaveLength(2));

    act(() => setOnline(false));
    server.setOffline(true);
    act(() => result.current.setQuery('Arrival'));
    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS + 100));

    await waitFor(() => expect(result.current.error).toMatch(/offline/i));
    expect(result.current.results).toEqual([]);

    // Back online: the paused search resumes by itself.
    server.setOffline(false);
    act(() => setOnline(true));
    await waitFor(() => expect(result.current.results[0]?.title).toBe('Arrival One'));
    expect(result.current.error).toBeNull();
  });
});
