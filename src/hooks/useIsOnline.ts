import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

// Connectivity as React Query sees it (fed by NetInfo), so UI and fetching never disagree.
export function useIsOnline() {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}
