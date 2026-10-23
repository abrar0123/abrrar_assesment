import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClientRestore, persistQueryClientSave } from '@tanstack/react-query-persist-client';
import { TmdbError } from '../../tmdb/client';
import { CACHE_BUSTER, CACHE_MAX_AGE, createQueryClient, queryPersister, shouldRetry } from '../queryClient';
import { movieKeys } from '../queryKeys';

beforeEach(() => AsyncStorage.clear());

describe('offline cache', () => {
  it('restores movies fetched in a previous session from disk', async () => {
    const before = createQueryClient();
    before.setQueryData(movieKeys.genres(), [{ id: 28, name: 'Action' }]);
    await persistQueryClientSave({ queryClient: before, persister: queryPersister, buster: CACHE_BUSTER });

    // Simulates a cold start with no network: a brand-new client, same disk.
    const after = createQueryClient();
    await persistQueryClientRestore({
      queryClient: after,
      persister: queryPersister,
      maxAge: CACHE_MAX_AGE,
      buster: CACHE_BUSTER,
    });

    expect(after.getQueryData(movieKeys.genres())).toEqual([{ id: 28, name: 'Action' }]);
  });

  it('drops a cache written by an incompatible app version', async () => {
    const before = createQueryClient();
    before.setQueryData(movieKeys.genres(), [{ id: 28, name: 'Action' }]);
    await persistQueryClientSave({ queryClient: before, persister: queryPersister, buster: 'old-version' });

    const after = createQueryClient();
    await persistQueryClientRestore({
      queryClient: after,
      persister: queryPersister,
      maxAge: CACHE_MAX_AGE,
      buster: CACHE_BUSTER,
    });

    expect(after.getQueryData(movieKeys.genres())).toBeUndefined();
  });
});

describe('retry policy', () => {
  it('retries flaky network and server errors a couple of times', () => {
    expect(shouldRetry(0, new TypeError('Network request failed'))).toBe(true);
    expect(shouldRetry(1, new TmdbError('Bad gateway', 502))).toBe(true);
    expect(shouldRetry(2, new TmdbError('Bad gateway', 502))).toBe(false);
  });

  it('does not retry requests that can never succeed (bad key, unknown movie)', () => {
    expect(shouldRetry(0, new TmdbError('Invalid API key', 401))).toBe(false);
    expect(shouldRetry(0, new TmdbError('Not found', 404))).toBe(false);
  });
});
