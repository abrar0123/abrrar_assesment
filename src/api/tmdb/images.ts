const IMAGE_CDN = 'https://image.tmdb.org/t/p';

export type ImageSize = 'w92' | 'w185' | 'w300' | 'w500' | 'w780' | 'original';

export const imageUrl = (path: string | null | undefined, size: ImageSize = 'w500') =>
  path ? `${IMAGE_CDN}/${size}${path}` : undefined;
