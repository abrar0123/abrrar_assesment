import { Video } from '@/src/api/tmdb';

// Picks the best YouTube video to play as a trailer, or null if there is none.
export const pickTrailer = (videos: Video[]) => {
  const youtube = videos.filter((v) => v.site === 'YouTube');
  return (
    youtube.find((v) => v.type === 'Trailer' && v.official) ??
    youtube.find((v) => v.type === 'Trailer') ??
    youtube.find((v) => v.type === 'Teaser') ??
    youtube[0] ??
    null
  );
};
