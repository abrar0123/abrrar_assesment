# How I used AI on this assessment

I built this app with **Claude Code** (the desktop app, model `claude-opus-5-5`). This page explains how the app and its git history were actually made. Nothing is hidden. The full session logs are in [`transcripts/`](transcripts/).

> ✍️ Lines marked **✍️ TODO** are where I still need to add my own explanation.

---

## 1. Agent setup

I used Claude Code **with its default setup**. There was no `CLAUDE.md`, no `.cursor/` rules, no custom skills, agents or prompt templates, and nothing reusable from other projects. Everything Claude knew about the task came from my chat messages and the design and brief screenshots I pasted in.

---

## 2. How the app was actually built (Session 1)

📄 [`transcripts/01-build-session.md`](transcripts/01-build-session.md): one session from **22 Oct 2026, 18:13 PKT** to the early hours of 23 Oct.

I started from an existing Expo project of mine that had older screens (items/owners, Supabase, Tailwind). This is the real order of what happened:

| Time (PKT) | What I asked for / what happened                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18:13      | Make the app open straight into the tab screens.                                                                                                                                |
| 19:23      | Pasted the three design and brief screenshots and asked for the movie app as specified. Claude built the Watch tab, search, movie details, trailer and seat booking.            |
| 19:45      | Stopped Claude while it was waiting on the simulator, and gave it my TMDb key (redacted in the logs).                                                                           |
| 20:28      | **Commit:** "Build TMDb movie app with search, trailer and seat booking"                                                                                                        |
| 20:51      | Pasted a screenshot and told it the screen had to match the design exactly.                                                                                                     |
| 20:55      | Asked for confirmed bookings to be saved in AsyncStorage and shown on the Dashboard, which was empty.                                                                           |
| 21:04      | Asked for debounced search.                                                                                                                                                     |
| 21:24      | **Commit:** "Debounce movie search and cancel stale requests"                                                                                                                   |
| 21:24      | Asked for a clean, senior-level structure and best practices. Claude moved the code into `src/features/*`, removed the old Supabase/Tailwind code, and added tests and tooling. |
| 21:44      | **Commit:** "Refactor into feature-based structure with tests and tooling"                                                                                                      |
| 21:52      | Pasted the requirements list and asked for each item to be implemented one by one. Claude also removed `ios/` and the Firebase config files from git.                           |
| 23:13      | Pasted the theory questions and asked for answers. Claude's response was stopped by a safety filter.                                                                            |

So the app was built in a few **big steps** (one large prompt, then corrections and additions), not in small slices.

✍️ TODO: who wrote `ANSWERS.md` and how (for example: written by me, or drafted with AI and edited by me).

---

## 3. How the git history in this repo was made (Session 2) ⚠️

📄 [`transcripts/02-git-history-session.md`](transcripts/02-git-history-session.md)

**The branch history you see in this repo was rebuilt after the app was finished. It is not the order the app was written in.**

- Session 1 made real commits (listed above). The `.git` folder holding them was gone by the time Session 2 started, so those commits are lost.
  ✍️ TODO: why the original `.git` folder was removed.
- On **23 Oct 2026 at ~16:35 PKT** I asked Claude Code to put the finished code into a fresh repo with feature branches. It split the final files into 12 branches (setup, 10 features, docs) and merged them into `develop` with `--no-ff`, then into `main` as `v1.0.0`.
- All of those commits were created **within about 5 seconds** (16:35:20–16:35:25), as the commit timestamps show. Every commit contains final code. For example, the `feature/design-system` commit already has the folder structure that really only came from the 21:24 refactor.
- Claude checked that the final tree matched my working copy exactly and that `tsc` and all 44 Jest tests passed. It did not check that each intermediate commit builds on its own.

After that I read your brief ("the git history should show the app arriving in pieces… don't hide it") and asked Claude to check the repo against it. It told me plainly that this history didn't meet that point, and suggested writing this document instead of faking a step-by-step history (for example by backdating commits). I agreed.

### Requirements check (later in Session 2)

These commits were made one at a time and do show work arriving in pieces. I pasted the "requirements" slide and asked Claude to check the app against it, with offline-first as the priority. It read the config and code before changing anything:

- **Stack & build:** already met (Expo SDK 55 / RN 0.83, TypeScript strict, New Architecture only, `targetSdk` 36, iOS 15.1, all orientations). No changes.
- **Offline-first:** mostly met (persisted React Query cache, `offlineFirst` network mode, NetInfo, disk image cache, on-device bookings). It found two real gaps, fixed each test-first on its own branch, and committed the failing test before the fix:
  - `feature/offline-pagination-footer`: when the next page was paused offline or failed, the list just stopped with a blank footer. It now says "You're offline. More movies will load when you reconnect." (and resumes on its own) or offers **Try again**.
  - `fix/booking-storage-writes`: overlapping booking saves and cancels could overwrite each other and lose bookings (the new test reproduced it). Writes are now queued.
- **States, responsive UI, tests:** every screen already had loading, empty and error states, plus a responsive layout and behaviour tests. Its new offline test first caused a React `act(...)` warning, which it fixed before committing.

✍️ TODO: what I checked myself in this audit (for example, running it offline on a device).

---

## 4. Where I steered the model

These are the points in Session 1 where I changed what Claude was doing. Each needs **why** in my own words.

1. **Design screenshots (19:23)**: gave Claude the design and brief instead of letting it guess the UI.
   ✍️ TODO: why.
2. **"This screen should be the same as this" (20:51)**: the screen Claude built didn't match the design, so I sent a screenshot and asked for it to match exactly.
   ✍️ TODO: what was wrong and why it mattered.
3. **Bookings in AsyncStorage, shown on the Dashboard (20:55)**: the Dashboard was empty after booking.
   ✍️ TODO: why AsyncStorage, and what was missing.
4. **Debounced search (21:04)**: search ran on every keystroke.
   ✍️ TODO: why.
5. **Clean-code / senior-level refactor (21:24)**: Claude's first version worked but wasn't structured the way I wanted.
   ✍️ TODO: what I didn't like about the first structure.
6. **Requirements one by one (21:52)**: I made Claude go through the requirements list item by item instead of in one pass.
   ✍️ TODO: why.
7. **Stopping it at 19:45**: Claude was waiting on the simulator, so I interrupted it.
   ✍️ TODO: why.
8. **Git history (Session 2)**: I asked for feature branches, chose `main` + `develop`, chose not to add AI co-author lines to commits, and then decided to document the rebuilt history openly rather than leave it unexplained.
   ✍️ TODO: anything to add.
9. **Requirements check (Session 2)**: I asked for the app to be checked against the requirements slide, with offline-first first, rather than accepting the README's own claims.
   ✍️ TODO: why.

✍️ TODO: any place where I knew Claude was wrong and overrode it (a bug, a bad library choice, a wrong API usage), even if it isn't obvious from my short messages.

---

## 5. About the transcripts

The transcripts were exported from Claude Code's local session logs (`~/.claude/projects/…/*.jsonl`) by a script. **Nothing was reworded or tidied.** Mechanical changes only:

- **Redacted:** my TMDb API key (every occurrence, shown as `[REDACTED_TMDB_KEY]`), env-variable values, and one email address that Claude Code had attached as account context.
- **Left out:** Claude Code's automatic system messages, the model's internal reasoning, and simulator screenshots.
- **Shortened:** tool commands longer than 3,000 characters and tool outputs longer than 800 characters are cut off, marked `… [N more characters omitted]`.
- **Images:** the screenshots I pasted are in [`images/`](images/) and linked where I sent them.
- A third log file was an earlier copy of the start of Session 2 (the same conversation, resumed), so it isn't included separately.
- Session 2 was exported while it was still running, so it ends just before this document was first committed. The requirements check came after that export, so it isn't in the transcript yet.
