import { onlineManager } from '@tanstack/react-query';
import { TmdbError } from './tmdb/client';

// Turns any thrown value into a sentence we can show the user.
export function toUserMessage(error: unknown): string {
  if (!onlineManager.isOnline()) return "You're offline. Connect to the internet and try again.";
  if (error instanceof TmdbError) return error.message;
  if (error instanceof Error && /network request failed/i.test(error.message)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return 'Something went wrong. Please try again.';
}
