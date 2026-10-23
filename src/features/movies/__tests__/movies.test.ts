import { Video } from '@/src/api/tmdb';
import { releaseLabel } from '../hooks/useMovieDetails';
import { pickTrailer } from '../utils/trailer';

const video = (overrides: Partial<Video>): Video => ({
  id: 'v',
  key: 'k',
  name: 'n',
  site: 'YouTube',
  type: 'Trailer',
  official: false,
  ...overrides,
});

describe('pickTrailer', () => {
  it('prefers an official YouTube trailer', () => {
    const videos = [
      video({ key: 'teaser', type: 'Teaser' }),
      video({ key: 'fan', official: false }),
      video({ key: 'official', official: true }),
    ];
    expect(pickTrailer(videos)?.key).toBe('official');
  });

  it('falls back to a teaser, and ignores non-YouTube videos', () => {
    expect(
      pickTrailer([video({ key: 'vimeo', site: 'Vimeo' }), video({ key: 't', type: 'Teaser' })])?.key,
    ).toBe('t');
  });

  it('returns null when nothing is playable', () => {
    expect(pickTrailer([video({ site: 'Vimeo' })])).toBeNull();
  });
});

describe('releaseLabel', () => {
  const today = new Date(2026, 9, 22);

  it('says "In Theaters" for upcoming movies and "Released" for past ones', () => {
    expect(releaseLabel('2026-12-22', today)).toBe('In Theaters December 22, 2026');
    expect(releaseLabel('2026-07-15', today)).toBe('Released July 15, 2026');
  });

  it('handles a missing date', () => {
    expect(releaseLabel(undefined, today)).toBe('Release date to be announced');
  });
});
