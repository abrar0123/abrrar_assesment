import React, { ReactNode, useEffect, useState } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  CACHE_BUSTER,
  CACHE_MAX_AGE,
  createQueryClient,
  queryPersister,
  registerQueryListeners,
  restartStuckQueriesOnReconnect,
} from './queryClient';

registerQueryListeners();

// Query cache restored from disk on launch, so previously seen screens render offline.
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  useEffect(() => restartStuckQueriesOnReconnect(client), [client]);

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{ persister: queryPersister, maxAge: CACHE_MAX_AGE, buster: CACHE_BUSTER }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
