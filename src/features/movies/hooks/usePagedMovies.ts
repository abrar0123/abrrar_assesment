import { useMemo } from 'react';
import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import { Movie, Paged } from '@/src/api/tmdb';
import { useScreenState } from '@/src/api/query';
import { useIsOnline } from '@/src/hooks/useIsOnline';

// What the end of a loaded list should show.
export type LoadMoreState = 'idle' | 'loading' | 'offline' | 'error';

interface Options {
  queryKey: QueryKey;
  fetchPage: (page: number, signal: AbortSignal) => Promise<Paged<Movie>>;
  staleTime?: number;
  enabled?: boolean;
}

// Infinite-scroll list over any paged TMDb endpoint, cached and persisted by React Query.
export function usePagedMovies({ queryKey, fetchPage, staleTime, enabled = true }: Options) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetchPage(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
    staleTime,
    enabled,
  });

  const online = useIsOnline();

  const movies = useMemo(() => {
    // TMDb occasionally repeats a movie across pages; keep list keys unique.
    const seen = new Set<number>();
    return (query.data?.pages ?? [])
      .flatMap((p) => p.results)
      .filter((m) => !seen.has(m.id) && !!seen.add(m.id));
  }, [query.data]);
  const screen = useScreenState(query, movies.length > 0);

  return {
    movies,
    total: query.data?.pages[0]?.total_results ?? 0,
    loading: enabled && screen.loading,
    loadMoreState: loadMoreState(query, online),
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    error: enabled ? screen.error : null,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage && !query.isError) query.fetchNextPage();
    },
    retryLoadMore: () => query.fetchNextPage(),
    refresh: () => query.refetch(),
  };
}

interface PagedQueryLike {
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
}

// A paused or failed page request leaves isFetchingNextPage false, so say why the list stopped.
function loadMoreState(query: PagedQueryLike, online: boolean): LoadMoreState {
  if (query.isFetchingNextPage) return 'loading';
  if (query.hasNextPage && !online) return 'offline';
  if (query.isFetchNextPageError) return 'error';
  return 'idle';
}
