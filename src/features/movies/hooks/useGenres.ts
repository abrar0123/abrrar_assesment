import { useQueries, useQuery } from '@tanstack/react-query';
import { Genre, discoverByGenre, getGenres } from '@/src/api/tmdb';
import { blockingMessage, movieKeys, staleTimes } from '@/src/api/query';

export function useGenres() {
  const query = useQuery({ queryKey: movieKeys.genres(), queryFn: getGenres, staleTime: staleTimes.genres });
  return {
    genres: query.data ?? [],
    loading: query.isPending && query.fetchStatus !== 'paused',
    error: blockingMessage(query, !!query.data),
    retry: () => query.refetch(),
  };
}

// One backdrop per genre for the search grid. Fetched only while the grid is visible.
export function useGenreImages(genres: Genre[], enabled: boolean): Record<number, string | null> {
  const results = useQueries({
    queries: genres.map((g) => ({
      queryKey: movieKeys.genreCover(g.id),
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const { results: movies } = await discoverByGenre(g.id, 1, signal);
        const pick = movies.find((m) => m.backdrop_path) ?? movies[0];
        return pick?.backdrop_path ?? pick?.poster_path ?? null;
      },
      staleTime: staleTimes.genres,
      enabled,
    })),
  });

  return Object.fromEntries(genres.map((g, i) => [g.id, results[i]?.data ?? null]));
}
