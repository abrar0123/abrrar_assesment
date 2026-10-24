import React, { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { restartStuckQueriesOnReconnect } from '@/src/api/query';

// Same defaults as the app, minus retries/backoff so failures surface immediately in tests.
export function createTestQueryClient({ retry = false }: { retry?: boolean | number } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: { retry, retryDelay: 10, gcTime: Infinity, networkMode: 'offlineFirst' },
    },
  });
}

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function createWrapper(client = createTestQueryClient()) {
  function Wrapper({ children }: { children: ReactNode }) {
    useEffect(() => restartStuckQueriesOnReconnect(client), []); // as QueryProvider does in the app
    return (
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    );
  }
  return Wrapper;
}

export const setOnline = (online: boolean) => onlineManager.setOnline(online);
