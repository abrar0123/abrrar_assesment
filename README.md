# Movie App (TMDb)

React Native (Expo Router) app that lists upcoming movies from [TMDb](https://developer.themoviedb.org/docs), with search, movie details, trailer playback and a ticket/seat booking flow.

## Setup

Requirements: **Node 22** (`nvm use` reads `.nvmrc`), Xcode 16+ for iOS, Android Studio with SDK 36 for Android.

1. Install dependencies:

   ```bash
   nvm use
   yarn install
   ```

2. Add your TMDb key. The app reads it from the **`EXPO_PUBLIC_TMDB_API_KEY` environment variable**, loaded from a local `.env` file (git-ignored, never committed):

   ```bash
   cp .env.example .env
   # then set EXPO_PUBLIC_TMDB_API_KEY=<your key>
   ```

   Either a v3 **API key** (sent as `api_key`) or a v4 **Read Access Token** (sent as a Bearer token) works; the client detects which. Restart Metro with `--clear` after editing `.env`.

3. Build and run. Native folders are generated from `app.json` (Continuous Native Generation), so they are not committed:

   ```bash
   yarn ios
   yarn android
   ```

   If CocoaPods fails with `Unicode Normalization not appropriate for ASCII-8BIT`, run `export LANG=en_US.UTF-8` first.

## Features

| Screen       | What it does                                                                                           | TMDb endpoint                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Watch        | Upcoming movies, infinite scroll, pull to refresh                                                      | `GET /movie/upcoming`                                                 |
| Search       | Genre grid when empty; live "Top Results" while typing (debounced); **Go** opens the full results list | `GET /search/movie`, `GET /genre/movie/list`, `GET /discover/movie`   |
| Results      | "N Results Found" list for a query or a genre, paginated                                               | `GET /search/movie`, `GET /discover/movie`                            |
| Movie detail | Poster, release date, genres, overview, Get Tickets, Watch Trailer                                     | `GET /movie/{id}`, `GET /movie/{id}/images`, `GET /movie/{id}/videos` |
| Trailer      | Full-screen YouTube player; closes automatically when the trailer ends (or via **Done**)               | `GET /movie/{id}/videos`                                              |
| Tickets      | Date picker and hall/showtime cards with seat-map preview                                              | — (mocked)                                                            |
| Seats        | Seat map with zoom, VIP/regular/unavailable seats, selected-seat chips, live total                     | — (mocked)                                                            |

Images come from the TMDb image CDN (`https://image.tmdb.org/t/p/{size}/{file_path}`).

TMDb has no cinema showtime data, so halls, dates and taken seats are generated in `src/features/booking/data/cinema.ts`. Taken seats are seeded by movie + date + hall, so they stay the same each time you open the same show.

Confirmed bookings are saved on-device with AsyncStorage and listed on the **Dashboard** tab (with cancel). Seats you already booked show as taken when you reopen the same show. Media Library and More are placeholder tabs.

## How the requirements are met

| Requirement                                | Implementation                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Native + TypeScript, current release | Expo SDK 55 · React Native 0.83 · React 19.2 · TypeScript strict. See [why SDK 55](#why-expo-sdk-55-and-not-58).                                              |
| New Architecture only                      | SDK 55 runs only on the New Architecture (Fabric + TurboModules); no legacy-bridge code or flags.                                                             |
| Android target API 36, iOS 15+             | `expo-build-properties`: `compileSdk`/`targetSdk` 36, `minSdk` 24; iOS deployment target 15.1.                                                                |
| Portrait and landscape                     | `orientation: "default"`; layouts adapt via `useResponsive` (grid columns by width, side-by-side detail and seat screens in landscape, notch insets).         |
| Functional components and hooks            | No class components; the crash fallback uses Expo Router's function `ErrorBoundary`.                                                                          |
| Clean architecture                         | Feature modules (`src/features/*`) with hooks for logic, components for UI, pure functions for rules; thin route files.                                       |
| Offline-first                              | TanStack Query cache persisted to AsyncStorage (7 days), `networkMode: 'offlineFirst'`, NetInfo-driven online state, disk-cached images, on-device bookings.  |
| Every state designed                       | Skeletons for every list/detail, empty states with guidance, errors with retry, an offline banner, and an offline/failed trailer state.                       |
| Pixel-precise, responsive UI               | Design tokens for colour/type/spacing; layouts measured from the window/containers rather than fixed device sizes.                                            |
| Meaningful tests                           | Behaviour tests render real routes against a fake TMDb server: debounced search, offline cache, error → retry, seat pricing, booking persistence, cancelling. |

### Caching & refetch strategy

| Data                            | Fresh for | Then                        |
| ------------------------------- | --------- | --------------------------- |
| Genres                          | 7 days    | refetched in the background |
| Upcoming / genre lists          | 30 min    | refetched in the background |
| Movie detail (+ videos, images) | 6 h       | refetched in the background |
| Search results                  | 15 min    | refetched in the background |

- Cached data is **always shown first**, then refreshed if stale: on mount, when the app returns to the foreground, and when the connection comes back.
- The whole cache is **persisted to AsyncStorage for 7 days**, so a cold start offline still shows everything seen before. A cache buster invalidates it after breaking changes.
- **Retries:** network and 5xx errors retry twice with backoff; 4xx errors (bad key, unknown movie) fail immediately.
- **Offline:** requests pause instead of failing and resume on reconnect. An app-wide banner says "Offline · showing saved data". Screens with nothing saved say you're offline instead of showing skeletons, even while a request with no signal is still hanging, and load as soon as the connection returns (stuck requests are cancelled and restarted). Infinite lists that reach the end of what's cached say so ("More movies will load when you reconnect") and continue on their own. A failed page shows **Try again** without hiding what's already loaded.
- **Images** use `expo-image` with a memory + disk cache.
- **Bookings** are local data in AsyncStorage and are fully available offline. Changes are queued so overlapping saves and cancels can't overwrite each other.

### Why these libraries

| Library                                                               | Why                                                                                                                                                    |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Expo (SDK 55) + Expo Router**                                       | Managed native config (CNG), file-based typed routes, painless upgrades; the standard way to start a React Native app today.                           |
| **TanStack Query** (+ persist client, AsyncStorage persister)         | De-facto server-state library: caching, dedupe, cancellation, retries, pagination and offline pausing — far less custom code than a hand-rolled store. |
| **@react-native-community/netinfo**                                   | Reliable connectivity signal to drive React Query's `onlineManager` and the offline banner.                                                            |
| **expo-image**                                                        | Disk-cached, recyclable images (posters work offline; smooth lists).                                                                                   |
| **AsyncStorage**                                                      | Simple, well-supported persistence for the small booking list and query cache.                                                                         |
| **react-native-youtube-iframe**                                       | TMDb trailers are YouTube videos; this wraps the official IFrame API with `ended` events to auto-close.                                                |
| **Jest + React Native Testing Library + expo-router/testing-library** | Tests interact with screens the way a user does (by text and accessibility labels), including navigation.                                              |
| No Redux / Zustand                                                    | Server state lives in React Query; the remaining state is local to screens. A global store would add ceremony without a use.                           |

### Why Expo SDK 55 and not 58

The brief asks for both a _current release_ **and** _iOS 15+_. Expo SDK 56–58 raised the minimum iOS version to 16.4, so they can't run on iOS 15. SDK 55 (React Native 0.83, February 2026, still receiving patches) is the newest release that meets both requirements. Moving to SDK 58 is a version bump plus a deployment-target change once iOS 15 support isn't needed.

## Scripts

| Command          | What it does                                        |
| ---------------- | --------------------------------------------------- |
| `yarn ios`       | Build and run on the iOS simulator                  |
| `yarn start`     | Start Metro (add `--clear` after editing `.env`)    |
| `yarn typecheck` | TypeScript check (`tsc --noEmit`)                   |
| `yarn lint`      | ESLint (Expo config)                                |
| `yarn format`    | Format with Prettier (`format:check` to verify)     |
| `yarn test`      | Jest unit tests                                     |
| `yarn validate`  | All of the above checks, in order — run before a PR |

## Project structure

Feature-based: routes in `app/` stay thin and compose hooks and components from `src/features/*`. Each feature exposes its public API through an `index.ts` barrel; screens never import a feature's internal files.

```
app/                              Expo Router routes (screens only)
  index.tsx                       redirect → Watch tab
  (tabs)/                         bottom tabs
    dashboard.tsx                 saved bookings
    watch/index.tsx               upcoming list + search mode
    watch/results.tsx             search / genre results
  movie/[id].tsx                  movie detail
  trailer/[id].tsx                full-screen trailer player
  booking/[id].tsx                date + hall selection
  booking/seats.tsx               seat selection + checkout
src/
  api/tmdb/                       TMDb HTTP client, endpoints, types, image URLs
  config/env.ts                   typed access to EXPO_PUBLIC_* env vars
  features/
    movies/                       components, hooks (search, details, paging), utils
    booking/                      components, hooks (seat selection, bookings),
                                  data (halls, seat layout), storage (AsyncStorage), utils
  components/                     shared UI: Button, ScreenHeader, StatusViews, SectionLabel…
  hooks/                          generic hooks: useDebounce, useIsOnline, useResponsive
  theme/                          design tokens: colors, typography, spacing
  utils/                          date and array helpers
  test/                           fake TMDb server and render helpers for tests
tests/                            screen-level behaviour tests (outside app/ so they aren't routes)
```

## Conventions

- **Logic in hooks, UI in components.** Screens wire navigation to feature hooks (`useMovieSearch`, `useMovieDetails`, `useSeatSelection`, `useBookings`).
- **Tests describe behaviour** — screen tests in `tests/` drive real routes against a fake TMDb server; pure rules (seat map, pricing, trailer choice, dates) have focused unit tests next to the code in `__tests__/`.
- **Design tokens only** — colors, fonts and spacing come from `src/theme`, not hard-coded values.
- **Abortable requests** — React Query passes an `AbortSignal` to every request, so stale responses (e.g. older search queries) are cancelled.
- **Secrets** stay in `.env` (git-ignored); `.env.example` documents the variables.

## How AI was used

Built with Claude Code. See [`docs/ai/AI_WORKFLOW.md`](docs/ai/AI_WORKFLOW.md) for how the app and its git history were made, where I steered the model, and the full session transcripts.

## Demo videos (previous submission)

- App Demo: https://www.loom.com/share/97fb6ee1cd5c4b5da3286095c6e927f9
- Part 2: https://www.loom.com/share/dc2efc47405a488a9d1bd3ce0684b6bc
- Part 3 & 4: https://www.loom.com/share/b6192b01a0274d62ab45c75f46b52ee3
