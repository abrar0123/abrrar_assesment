// Central query-key factory so caching, invalidation and tests all agree on the same keys.
export const movieKeys = {
  all: ['movies'] as const,
  upcoming: () => [...movieKeys.all, 'upcoming'] as const,
  genres: () => [...movieKeys.all, 'genres'] as const,
  genreCover: (genreId: number) => [...movieKeys.all, 'genre-cover', genreId] as const,
  byGenre: (genreId: number) => [...movieKeys.all, 'by-genre', genreId] as const,
  search: (query: string) => [...movieKeys.all, 'search', query.toLowerCase()] as const,
  topResults: (query: string) => [...movieKeys.all, 'top-results', query.toLowerCase()] as const,
  detail: (id: string) => [...movieKeys.all, 'detail', id] as const,
};
