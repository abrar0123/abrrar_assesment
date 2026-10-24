import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import TabLayout from '@/app/(tabs)/_layout';
import WatchLayout from '@/app/(tabs)/watch/_layout';
import WatchScreen from '@/app/(tabs)/watch/index';
import ResultsScreen from '@/app/(tabs)/watch/results';
import { movieKeys } from '@/src/api/query';
import { createTmdbServer, movie, page } from '@/src/test/tmdbServer';
import { createTestQueryClient, createWrapper, setOnline } from '@/src/test/render';

const server = createTmdbServer();
const routes = {
  '(tabs)/_layout': TabLayout,
  '(tabs)/watch/_layout': WatchLayout,
  '(tabs)/watch/index': WatchScreen,
  '(tabs)/watch/results': ResultsScreen,
  '(tabs)/dashboard': () => null,
  '(tabs)/media-library': () => null,
  '(tabs)/more': () => null,
};

const renderWatch = (client = createTestQueryClient(), initialUrl = '/watch') =>
  renderRouter(routes, { initialUrl, wrapper: createWrapper(client) });

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

  describe('opening a screen offline with nothing saved', () => {
    const actionMovies = '/watch/results?genreId=28&genreName=Action';

    beforeEach(() => {
      // On a real phone with no signal, requests hang instead of failing straight away.
      act(() => setOnline(false));
      server.setStalled(true);
    });

    it('says it is offline instead of showing skeletons forever', async () => {
      renderWatch(createTestQueryClient({ retry: 1 }), actionMovies);

      expect(await screen.findByText(/you're offline/i)).toBeVisible();
      expect(screen.queryByText('Loading…')).toBeNull();
      expect(screen.queryByText(/0 results found/i)).toBeNull();
    });
  });

  describe('loading more at the end of the list', () => {
    beforeEach(() => {
      server.on('/movie/upcoming', (params) =>
        params.get('page') === '2'
          ? page([movie(5, 'Second Page Movie')], 2, 2)
          : page([movie(1, 'Hope')], 1, 2),
      );
    });

    it('says why the list stopped while offline, then continues on reconnect', async () => {
      // Retries on, like the app: an offline page request pauses instead of failing.
      renderWatch(createTestQueryClient({ retry: 1 }));
      await screen.findByText('Hope');

      act(() => setOnline(false));
      server.setOffline(true);
      fireEvent(screen.getByTestId('upcoming-list'), 'endReached');

      expect(
        await screen.findByText(/you're offline\. more movies will load when you reconnect/i),
      ).toBeVisible();

      server.setOffline(false);
      act(() => setOnline(true));

      expect(await screen.findByText('Second Page Movie')).toBeVisible();
      expect(screen.queryByText(/you're offline/i)).toBeNull();
    });

    it('offers a retry when the next page fails, keeping what is already shown', async () => {
      renderWatch();
      await screen.findByText('Hope');

      server.on('/movie/upcoming', () => {
        throw Object.assign(new Error('TMDb is down'), { status: 500 });
      });
      fireEvent(screen.getByTestId('upcoming-list'), 'endReached');

      expect(await screen.findByText("Couldn't load more movies.")).toBeVisible();
      expect(screen.getByText('Hope')).toBeVisible();

      server.on('/movie/upcoming', () => page([movie(5, 'Second Page Movie')], 2, 2));
      fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByText('Second Page Movie')).toBeVisible();
    });
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
