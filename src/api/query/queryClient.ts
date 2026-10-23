import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import { TmdbError } from '../tmdb/client';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// How long cached data is trusted before a background refetch, per kind of data.
// Data older than this is still shown immediately (offline or not) while it refreshes.
export const staleTimes = {
  genres: 7 * DAY, // practically static
  upcoming: 30 * MINUTE, // changes daily at most
  movie: 6 * HOUR, // details, videos, images
  search: 15 * MINUTE,
} as const;

// Cached data is kept (and persisted to disk) for a week so the app stays useful offline.
export const CACHE_MAX_AGE = 7 * DAY;

// 4xx responses (bad key, unknown movie) won't succeed on retry; network and 5xx errors might.
export const shouldRetry = (failureCount: number, error: unknown) => {
  if (error instanceof TmdbError && error.status !== undefined && error.status < 500) return false;
  return failureCount < 2;
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: CACHE_MAX_AGE,
        staleTime: staleTimes.movie,
        retry: shouldRetry,
        // Serve cached data first, even with no connection; only fetch when online.
        networkMode: 'offlineFirst',
        refetchOnReconnect: true,
        refetchOnWindowFocus: true, // = app returns to the foreground (see focusManager below)
      },
    },
  });
}

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'query-cache:v1',
  throttleTime: 1000,
});

// Bump to discard persisted caches after a breaking change to the cached data's shape.
export const CACHE_BUSTER = 'tmdb-v1';

let listenersRegistered = false;

// Teach React Query about React Native's connectivity and app lifecycle (it assumes a browser).
export function registerQueryListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    }),
  );

  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'));
  }
}
