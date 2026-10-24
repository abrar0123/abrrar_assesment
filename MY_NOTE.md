1. Architectural Choice

I used TanStack Query for server-state management and persisted its cache for offline access. I chose it over Redux because it provides caching, retries, request cancellation, and pagination without extra boilerplate. I also organized the code by features to keep it maintainable.

1. Search Freshness

I used a 400ms debounce to reduce unnecessary API calls, unique query keys for caching, and AbortSignal to cancel outdated requests. I also handled offline states to prevent old results from appearing under a new search query.

3. What I Would Improve

The watch screen currently handles both browsing and searching, so I would split these into separate components. I would also add request timeouts to improve reliability when the network is unavailable.

4. Scaling to 10× More Data

The persisted cache would likely become a bottleneck because the entire cache is stored as JSON in AsyncStorage. I would move to MMKV, persist only essential queries, limit cached pages, and use SQLite for bookings. For long lists, I would consider FlashList for better rendering performance.