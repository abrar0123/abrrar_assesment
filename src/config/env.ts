// Values Expo inlines from .env at bundle time (only EXPO_PUBLIC_* are exposed to the app).
// Restart Metro with --clear after changing .env.
export const env = {
  tmdbApiKey: process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '',
} as const;
