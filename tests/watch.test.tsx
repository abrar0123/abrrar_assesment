import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import TabLayout from '@/app/(tabs)/_layout';
import WatchLayout from '@/app/(tabs)/watch/_layout';
import WatchScreen from '@/app/(tabs)/watch/index';
import { movieKeys } from '@/src/api/query';
import { createTmdbServer, movie, page } from '@/src/test/tmdbServer';
import { createTestQueryClient, createWrapper, setOnline } from '@/src/test/render';

const server = createTmdbServer();
const routes = {
  '(tabs)/_layout': TabLayout,
  '(tabs)/watch/_layout': WatchLayout,
  '(tabs)/watch/index': WatchScreen,
  '(tabs)/dashboard': () => null,
  '(tabs)/media-library': () => null,
  '(tabs)/more': () => null,
};

const renderWatch = (client = createTestQueryClient()) =>
  renderRouter(routes, { initialUrl: '/watch', wrapper: createWrapper(client) });

beforeEach(() => {
  server.install();
  server.reset();
  setOnline(true);
  server.on('/movie/upcoming', () => page([movie(1, 'Hope'), movie(2, 'Whalefall')]));
  server.on('/genre/movie/list', () => ({
    genres: [
      { id: 28, name: 'Action' },
      { id: 35, name: 'Comedy' },
    ],
  }));
  server.on('/discover/movie', () => page([movie(9, 'Cover')]));
  server.on('/search/movie', () => page([movie(3, 'Timeless')]));
});

describe('Watch screen', () => {
  it('lists upcoming movies from TMDb', async () => {
    renderWatch();

    expect(await screen.findByText('Hope')).toBeVisible();
    expect(screen.getByText('Whalefall')).toBeVisible();
  });

  it('shows an error with a retry when nothing is cached and loading fails', async () => {
    server.fail('/movie/upcoming', 500, 'TMDb is down');
    renderWatch();

    expect(await screen.findByText(/something went wrong|tmdb is down/i)).toBeVisible();

    server.on('/movie/upcoming', () => page([movie(1, 'Hope')]));
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Hope')).toBeVisible();
  });

  it('works offline from the saved cache, without an error', async () => {
    const client = createTestQueryClient();
    client.setQueryData(movieKeys.upcoming(), { pages: [page([movie(1, 'Saved Movie')])], pageParams: [1] });
    setOnline(false);
    server.setOffline(true);

    renderWatch(client);

    expect(await screen.findByText('Saved Movie')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  it('opens search with a genre grid, then shows top results for what the user types', async () => {
    renderWatch();
    await screen.findByText('Hope');

    fireEvent.press(screen.getByLabelText('Search movies'));
    expect(await screen.findByText('Action')).toBeVisible();

    fireEvent.changeText(screen.getByPlaceholderText('TV shows, movies and more'), 'Tim');

    expect(await screen.findByText('Top Results')).toBeVisible();
    expect(await screen.findByText('Timeless')).toBeVisible();
  });
});
