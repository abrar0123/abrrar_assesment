import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Movie, searchMovies } from '@/src/api/tmdb';
import { movieKeys, staleTimes, useScreenState } from '@/src/api/query';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useIsOnline } from '@/src/hooks/useIsOnline';

// Wait this long after the last keystroke before calling TMDb.
export const SEARCH_DEBOUNCE_MS = 400;

// Debounced "top results" search. Each query is cached (and persisted), so revisiting a
// query is instant and works offline; a newer query aborts the older in-flight request.
export function useMovieSearch() {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const debouncedQuery = useDebounce(trimmed, SEARCH_DEBOUNCE_MS);
  const online = useIsOnline();

  const result = useQuery<Movie[]>({
    queryKey: movieKeys.topResults(debouncedQuery),
    queryFn: ({ signal }) => searchMovies(debouncedQuery, 1, signal).then((r) => r.results),
    enabled: debouncedQuery.length > 0,
    staleTime: staleTimes.search,
    placeholderData: keepPreviousData, // keep showing old results while new ones load
  });

  // keepPreviousData is great while a request is in flight, but if the new query is stuck
  // waiting for a connection, the old results would be shown under the wrong query.
  const stalePlaceholder = result.isPlaceholderData && (result.fetchStatus === 'paused' || !online);
  const data = stalePlaceholder ? undefined : result.data;
  const { error } = useScreenState(result, !!data);

  return {
    query,
    setQuery,
    clear: () => setQuery(''),
    debouncedQuery,
    results: data ?? [],
    loading: result.isFetching,
    error: debouncedQuery ? error : null,
    retry: () => result.refetch(),
    // True while typing (timer pending) or while the request is in flight.
    isSearching: trimmed !== debouncedQuery || (!!debouncedQuery && result.isFetching),
  };
}
