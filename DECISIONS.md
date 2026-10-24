# Decisions and trade-offs

Each decision lists the alternative, why this one, what it costs, and when I'd change it. The library list itself is in the [README](README.md#why-these-libraries).

## Platform

### Expo SDK 55, not the latest SDK

- **Alternative:** SDK 56–58.
- **Why:** the brief asks for a current release **and** iOS 15+. SDK 56+ requires iOS 16.4, so SDK 55 (RN 0.83, still patched) is the newest that meets both.
- **Cost:** not the very latest Expo APIs.
- **Revisit when:** iOS 15 support can be dropped. It's then a version bump plus a deployment-target change.

### Expo with Continuous Native Generation (`ios/` and `android/` not committed)

- **Alternative:** bare React Native, or committing the native folders.
- **Why:** native config lives in `app.json` and config plugins, so `targetSdk` 36, iOS 15.1 and orientations are in one reviewable file, and upgrades don't mean hand-merging Xcode and Gradle files.
- **Cost:** custom native code has to go through a config plugin or a local module.
- **Revisit when:** the app needs heavy custom native code that plugins can't express.

## Architecture

### Feature modules with a public `index.ts`

- **Alternative:** folders by type (`components/`, `hooks/`, `screens/`).
- **Why:** everything about booking is in `src/features/booking`, so a teammate can change it without touching movies. Screens import only from the feature's `index.ts`, so internals can be refactored freely. Route files in `app/` stay thin.
- **Cost:** a little more structure up front, and a rule to keep shared code in `src/components` and `src/hooks` rather than inside one feature.

### Server state in TanStack Query, no global store

- **Alternative:** Redux Toolkit / RTK Query, Zustand + manual fetching.
- **Why:** almost all state here is server data: lists, details, search. TanStack Query gives caching, deduping, cancellation, retries, pagination and offline pausing. The rest is local screen state. A global store would add ceremony without a use.
- **Cost:** cache rules (keys, stale times, retries) need careful design, and that becomes the main thing to get right.
- **Revisit when:** real shared client state appears (for example auth, or a cart across screens). Then a small Zustand store, not Redux.

## Offline-first

### Persist the whole query cache to AsyncStorage for 7 days

- **Alternative:** no persistence (offline only while the app stays open), or MMKV / SQLite.
- **Why:** a cold start with no signal still shows everything seen before. AsyncStorage is official and works with TanStack's persister. A `buster` key drops old caches after a breaking change to the data's shape.
- **Cost:** AsyncStorage is slow for large data, and the whole cache is serialized together.
- **Revisit when:** the cache grows (many searches and details). Switch the persister to MMKV.

### Different "fresh" times per kind of data

- **Alternative:** one stale time for everything.
- **Why:** genres barely change (7 days), upcoming lists change daily (30 min), details rarely (6 h), search is volatile (15 min). Cached data is always shown first, then refreshed in the background.
- **Cost:** a user can briefly see data up to that old before the refresh lands.

### `networkMode: 'offlineFirst'`, with screen-level rules for offline

- **Alternative:** `'online'` mode, which never sends a request while NetInfo says offline.
- **Why keep it:** NetInfo can be wrong (for example, slow reachability checks right after waking), and `offlineFirst` still lets a first request through in that case.
- **Cost, found by testing on the simulator:** with no signal, that first request can **hang** instead of failing, so screens showed skeletons forever. Two fixes:
  - `useScreenState` (one rule for every screen): offline with nothing saved shows a message, not skeletons. It still shows skeletons while the saved cache is being read from disk, so the message doesn't flash on a cold start.
  - `restartStuckQueriesOnReconnect`: React Query's reconnect refetch joins a hanging request instead of replacing it when the query has no data, so on reconnect those requests are cancelled and restarted.
- **Not done yet:** a request timeout in the TMDb client, for "online but the network is dead" (for example, captive Wi-Fi).

### Retries: network and 5xx errors twice, 4xx never

- **Why:** a bad key or unknown movie will never succeed, so retrying only delays the error message.

## Booking

### Bookings stored only on the device

- **Alternative:** a backend.
- **Why:** the brief has no backend and TMDb has no showtimes, so bookings are local and fully usable offline.
- **Cost:** no sync across devices, and bookings are lost if the app is deleted.
- **Detail:** every change rewrites the whole list, so changes are queued one at a time. Overlapping saves and cancels used to lose bookings, which a test reproduced (`4e52ffe` → `9a115a7`).

### Mocked halls, dates and taken seats, seeded by movie + date + hall

- **Why:** the same show always looks the same when you reopen it, which keeps tests deterministic and the UX believable.

## UI

### FlatList, not FlashList

- **Why:** built in, and fast enough for these list sizes. FlashList is another native dependency to justify.
- **Revisit when:** profiling shows dropped frames on long lists.

### YouTube player in a WebView (`react-native-youtube-iframe`)

- **Why:** TMDb trailers are YouTube videos, which can't play in a native video player. The IFrame API gives an `ended` event to auto-close.
- **Cost:** needs a connection (the screen says so when offline), and it's heavier than native video.

### Responsive by measurement, not by device type

- **Why:** grid columns come from the available width (`useResponsive().columnsFor(minWidth)`), so the same code handles phones, tablets and both orientations. Detail and seat screens switch to side-by-side in landscape.

## Testing

### Behaviour tests against a fake TMDb server

- **Alternative:** snapshot tests, or mocking hooks.
- **Why:** tests render real routes and act like a user (by text and accessibility labels). `src/test/tmdbServer.ts` fakes the network, including going offline and **stalling**, the hanging-request case found on the simulator. A test breaks when behaviour breaks, not when markup moves.
- **Cost:** slower than unit tests; pure rules (seat map, pricing, dates) keep small unit tests next to the code.
- **Not done yet:** end-to-end tests on a device (Maestro), and CI running `yarn validate` on every PR.
