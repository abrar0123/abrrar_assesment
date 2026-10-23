import { useEffect, useState } from 'react';

// Returns `value` only after it has stopped changing for `delay` ms.
// Each keystroke resets the timer, so a burst of typing triggers one update.
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
