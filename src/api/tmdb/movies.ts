import { tmdbGet } from './client';
import { Genre, Movie, MovieDetail, MovieImages, Paged, Video } from './types';

export const getUpcoming = (page = 1, signal?: AbortSignal) =>
  tmdbGet<Paged<Movie>>('/movie/upcoming', { page }, signal);

export const getMovie = (id: number | string) => tmdbGet<MovieDetail>(`/movie/${id}`);

export const getMovieVideos = (id: number | string) =>
  tmdbGet<{ results: Video[] }>(`/movie/${id}/videos`).then((r) => r.results);

export const getMovieImages = (id: number | string) =>
  tmdbGet<MovieImages>(`/movie/${id}/images`, { include_image_language: 'en,null' });

export const searchMovies = (query: string, page = 1, signal?: AbortSignal) =>
  tmdbGet<Paged<Movie>>('/search/movie', { query, page, include_adult: 'false' }, signal);

export const discoverByGenre = (genreId: number, page = 1, signal?: AbortSignal) =>
  tmdbGet<Paged<Movie>>(
    '/discover/movie',
    { with_genres: genreId, page, sort_by: 'popularity.desc', include_adult: 'false' },
    signal,
  );

export const getGenres = () => tmdbGet<{ genres: Genre[] }>('/genre/movie/list').then((r) => r.genres);
