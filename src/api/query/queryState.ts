import { toUserMessage } from '../errors';

interface QueryLike {
  isError: boolean;
  error: unknown;
  fetchStatus: 'fetching' | 'paused' | 'idle';
}

// The message to show *instead of content*: only when there is nothing to show at all.
// A paused fetch (offline, nothing cached) counts too — otherwise it would look like "no results".
export function blockingMessage(query: QueryLike, hasData: boolean): string | null {
  if (hasData) return null;
  if (query.isError || query.fetchStatus === 'paused') return toUserMessage(query.error);
  return null;
}
