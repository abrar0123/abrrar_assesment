# How I used AI

I built this app with **Claude Code** (desktop app, Claude Opus). My role was product owner, reviewer and tester: I set the requirements, judged the output against the design and the brief, ran the app, and sent the model back when it was wrong. Claude Code wrote most of the code.

## How I worked

1. **Spec first.** I gave Claude the brief and the three design screenshots as the spec, rather than describing the app loosely.
2. **Review against the design.** I compared each screen with the design and sent corrections when it didn't match.
3. **Add what the first pass missed.** I asked for behaviour the brief implies but the first version lacked (see below).
4. **Audit against the requirements.** I pasted the requirements slide and had every item checked against the actual code, with offline-first as the priority.
5. **Test it myself.** I ran the app on the iOS simulator in offline conditions. That's where I found the bug the audit missed.

## Where I steered or corrected the model

| What I saw                                                                                                                                   | What I did                                                                                            | Result                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A screen didn't match the design.                                                                                                            | Sent a screenshot of the design and told it to match it exactly.                                      | Claude reworked that screen.                                                                                                            |
| The Dashboard was empty after booking a ticket.                                                                                              | Asked for confirmed bookings to be saved on the device with AsyncStorage and listed on the Dashboard. | `src/features/booking/storage`, Dashboard bookings list with cancel.                                                                    |
| Search had no debouncing.                                                                                                                    | Asked for debounced search.                                                                           | `useDebounce` + 400 ms delay, and older requests are cancelled.                                                                         |
| The first version worked, but it sat on top of leftovers from my earlier project (`src/lib`, `src/services`, Supabase, Tailwind).            | Asked for clean code, best practices and a proper folder structure.                                   | Old code removed, feature modules (`src/features/*`), logic in hooks, tests and tooling.                                                |
| I wanted every requirement handled explicitly, not assumed.                                                                                  | Pasted the requirements list and had them implemented one by one.                                     | Persisted offline cache, offline banner, responsive layouts, screen-level tests.                                                        |
| **After the AI's own audit said offline-first was met**, I opened the Action genre offline on the simulator and it showed skeletons forever. | Sent the screenshot as a bug.                                                                         | Root cause: with no signal, the first request hangs instead of failing. Fixed test-first: `4bf4f24` → `aabf88b`, `af06964` → `2e35cbe`. |

The last row is the one I'd point to: the model reviewed its own work and was confident, and running the app proved it wrong.

## Test-first fixes

From the requirements audit onwards, every fix has the failing test committed before the code:

| Problem                                                    | Failing test | Fix       |
| ---------------------------------------------------------- | ------------ | --------- |
| End of a list went blank offline or after a failed page    | `9c8f49d`    | `29cdb33` |
| Overlapping booking saves and cancels lost bookings        | `4e52ffe`    | `9a115a7` |
| Offline screen with nothing saved showed skeletons forever | `4bf4f24`    | `aabf88b` |
| After reconnecting, the stuck request blocked loading      | `af06964`    | `2e35cbe` |

## About the git history

- **Before `104d17f`:** the first version was built in one AI-assisted session on 22 Oct. I removed that original git history because it came from an earlier project and contained Supabase and Firebase files and keys. The feature branches up to `104d17f` (`Merge branch 'docs/readme'`) were then rebuilt from the finished code on 23 Oct. They show the structure of the app, not the order it was written in, which is why their timestamps are seconds apart.
- **From `9c8f49d` on:** commits were made as the work happened, one branch per change, merged into `develop` and then `main`.

## Agent setup and planning notes

- **Agent setup:** none for this build. I used Claude Code with its default settings, and no `CLAUDE.md`, rules or prompt templates.
- **Planning notes:** this build was driven by chat prompts. My spec was the brief and the design screenshots, and I don't have separate written plans to include.

## What I wrote myself

- `ANSWERS.md`, the answers to the theory questions, from my own project experience.
