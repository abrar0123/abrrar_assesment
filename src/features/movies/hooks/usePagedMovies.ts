import { useMemo } from 'react';
import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import { Movie, Paged } from '@/src/api/tmdb';
import { blockingMessage } from '@/src/api/query';

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

  const movies = useMemo(() => {
    // TMDb occasionally repeats a movie across pages; keep list keys unique.
    const seen = new Set<number>();
    return (query.data?.pages ?? [])
      .flatMap((p) => p.results)
      .filter((m) => !seen.has(m.id) && !!seen.add(m.id));
  }, [query.data]);

  return {
    movies,
    total: query.data?.pages[0]?.total_results ?? 0,
    loading: query.isPending && enabled && query.fetchStatus !== 'paused',
    loadingMore: query.isFetchingNextPage,
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    error: blockingMessage(query, movies.length > 0),
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage && !query.isError) query.fetchNextPage();
    },
    refresh: () => query.refetch(),
  };
}
