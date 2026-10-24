# CLAUDE.md

My working agreement for React Native projects. Everything above "This project" is reusable: copy it into a new repo and fill in that last section.

## How we work

- **One slice at a time.** Before coding, write a short plan in `notes/<feature>.md`: goal, screens touched, states, tests. Build it, check it, commit it, then move on. Don't build several features in one pass.
- **If the plan changes, keep both versions** in the notes file. Add a dated "Changed:" section; don't rewrite history.
- **Ask before** adding a dependency, changing architecture, touching native config, or deleting files. Say what you'd add and why.
- **Never claim it works without proof.** "Done" means `yarn validate` passes. If something wasn't run on a device or simulator, say so.
- **Tell me when you're unsure or when I'm wrong.** A short "I think this is a mistake because…" beats quietly doing it.

## Test-first

- For a bug: write a test that reproduces it, run it and see it fail, **commit the failing test**, then fix and commit the fix. Two commits.
- Test behaviour the user sees: render the real screen, find things by text or accessibility label, and fake the network rather than mocking hooks. No snapshot tests.
- Wrap anything that changes React state outside an event in `act()`. That includes connectivity changes (`onlineManager.setOnline`). Treat any `act(...)` warning as a failure.
- Offline tests need two network modes: **failing** (throws) and **stalled** (hangs until aborted). Real phones with no signal often hang.

## Git

- Branch per change: `feature/…`, `fix/…`, `docs/…`, `chore/…`, cut from `develop`. Merge with `--no-ff`, then `develop` into `main` for a release.
- Conventional commits: `type(scope): what changed`. The body says **why** and what was wrong before.
- Small commits that build on their own. Never rewrite pushed history or backdate commits.
- Never commit `.env`, keys, tokens, `GoogleService-Info.plist` or `google-services.json`. Check `git diff --cached` for secrets before every commit.

## Stack defaults

- Latest Expo SDK that meets the project's minimum OS versions. Check the iOS minimum before upgrading. TypeScript `strict`, New Architecture only.
- Expo Router (typed routes) and Continuous Native Generation. Native settings live in `app.json` and config plugins; `ios/` and `android/` are not committed.
- Server state: TanStack Query. Client state: local `useState` first, then a small Zustand store only when it's truly shared. No Redux unless the project already uses it.
- Storage: AsyncStorage for small data. Use MMKV for anything large or hot.
- Lists: FlatList until profiling shows a problem, then FlashList. Images: `expo-image` with `cachePolicy="memory-disk"`.

## Architecture

```
app/              routes only: thin screens that wire hooks to components
src/features/x/   components/, hooks/, utils/, data/, storage/, __tests__/, index.ts
src/api/          HTTP client, endpoints, types, query client, query keys
src/components/   shared UI       src/hooks/   generic hooks
src/theme/        design tokens   src/test/    fake server and render helpers
tests/            screen-level behaviour tests
```

- Screens import a feature **only** through its `index.ts`.
- Logic in hooks, UI in components, rules in pure functions with unit tests.
- Colours, fonts and spacing come from `src/theme`. No hard-coded hex values or magic numbers in components.
- Every request takes an `AbortSignal`.

## Offline-first checklist

Run through this for every screen that loads data:

- [ ] Saved data shows first, offline or not, then refreshes in the background.
- [ ] Query cache persisted, with a `maxAge` and a `buster` key.
- [ ] A stale time chosen per kind of data, not one global value.
- [ ] Never retry 4xx. Retry network and 5xx errors a couple of times.
- [ ] `onlineManager` fed by NetInfo, and `focusManager` fed by AppState.
- [ ] **Offline with nothing saved shows a message, not skeletons**, even while a request is still hanging. Skeletons only while something is really on its way, or while the cache restores from disk.
- [ ] On reconnect, requests that are still hanging for screens with no data are cancelled and restarted. React Query's reconnect refetch joins them instead.
- [ ] Infinite lists explain why they stopped (offline / failed + retry) instead of an empty footer.
- [ ] Local writes that read-modify-write are queued, so overlapping changes can't overwrite each other.
- [ ] Tried on a simulator or device with the network actually off.

## Every state designed

For each screen, check loading (skeletons shaped like the content), empty (says what to do next), error (says what happened, plus **Try again**), offline, a partial failure (keep what's shown), portrait, landscape, a small phone and a tablet. A title or count must never claim something it can't know (no "0 Results" when loading failed).

## Definition of done

1. `yarn validate` passes: typecheck, lint, format check, tests.
2. New behaviour has a test, and bug fixes have a failing-test commit first.
3. States checklist done for the screens touched.
4. README updated if setup, behaviour or decisions changed. Trade-offs go in `DECISIONS.md`: alternative, why, cost, when to revisit.
5. Say plainly what wasn't verified.

---

## This project

- **App:** TMDb movie browser with search, details, trailers and local seat booking (React Native take-home).
- **Stack:** Expo SDK 55 (newest that still supports iOS 15), RN 0.83, TanStack Query + AsyncStorage persister, NetInfo, expo-image.
- **Key files:** `src/api/query/queryClient.ts` (cache and retry rules), `src/api/query/queryState.ts` (`useScreenState`: loading vs. message), `src/test/tmdbServer.ts` (fake TMDb with offline and stalled modes).
- **Secrets:** `EXPO_PUBLIC_TMDB_API_KEY` in `.env` (see `.env.example`).
- **Decisions:** see `DECISIONS.md`.
- This file was added after the first version of the app was built. See `AI_USAGE.md`.
