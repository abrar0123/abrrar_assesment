import { useQuery } from '@tanstack/react-query';
import { getMovie, getMovieImages, getMovieVideos } from '@/src/api/tmdb';
import { blockingMessage, movieKeys, staleTimes } from '@/src/api/query';
import { formatLongDate, parseDate } from '@/src/utils/dates';
import { pickTrailer } from '../utils/trailer';

// Videos and images are optional extras: if they fail, the screen still shows the movie
// without a trailer or alternate poster.
async function fetchMovieDetails(id: string) {
  const [movie, videos, images] = await Promise.all([
    getMovie(id),
    getMovieVideos(id).catch(() => []),
    getMovieImages(id).catch(() => null),
  ]);
  return {
    movie,
    trailer: pickTrailer(videos),
    posterPath: images?.posters[0]?.file_path ?? movie.poster_path ?? movie.backdrop_path,
  };
}

export function useMovieDetails(id: string) {
  const query = useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: () => fetchMovieDetails(id),
    staleTime: staleTimes.movie,
  });

  return {
    data: query.data
      ? { ...query.data, releaseLabel: releaseLabel(query.data.movie.release_date) }
      : undefined,
    loading: query.isPending && query.fetchStatus !== 'paused',
    error: blockingMessage(query, !!query.data),
    retry: () => query.refetch(),
  };
}

export function releaseLabel(releaseDate: string | undefined, today = new Date()) {
  if (!releaseDate) return 'Release date to be announced';
  const released = parseDate(releaseDate) <= today;
  return `${released ? 'Released' : 'In Theaters'} ${formatLongDate(releaseDate)}`;
}
