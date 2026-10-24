import { useIsRestoring } from '@tanstack/react-query';
import { useIsOnline } from '@/src/hooks/useIsOnline';
import { toUserMessage } from '../errors';

interface QueryLike {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  fetchStatus: 'fetching' | 'paused' | 'idle';
}

export interface ScreenState {
  /** Nothing to show yet, but it's on its way: show skeletons. */
  loading: boolean;
  /** Nothing to show and nothing coming: show this message instead of content. */
  error: string | null;
}

interface Context {
  online: boolean;
  restoring: boolean; // the saved cache is still being read from disk
}

// What a screen with no data yet should show. Offline counts as "nothing coming" even while a
// request is in flight: on a phone with no signal the first request can hang for a minute
// instead of failing, and skeletons would promise content that isn't on its way.
export function screenState(query: QueryLike, hasData: boolean, { online, restoring }: Context): ScreenState {
  if (hasData) return { loading: false, error: null };
  if (restoring) return { loading: query.isPending, error: null };

  const blocked = !online || query.isError || query.fetchStatus === 'paused';
  return {
    loading: query.isPending && !blocked,
    error: blocked ? toUserMessage(query.error) : null,
  };
}

export function useScreenState(query: QueryLike, hasData: boolean): ScreenState {
  const online = useIsOnline();
  const restoring = useIsRestoring();
  return screenState(query, hasData, { online, restoring });
}
