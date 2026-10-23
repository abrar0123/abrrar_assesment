10. When would you use FlatList, SectionList, or FlashList?
Answer:
My default choice is based on data volume, rendering complexity, and user experience requirements.
    • FlatList for standard lists. I use FlatList for most standard screens where the dataset is reasonably sized and item rendering is straightforward.
         For example, in a fitness app I displayed around 200 trainers with images and ratings, and FlatList performed well.
    • SectionList when data needs grouping. For example, in a healthcare app appointments were grouped into "Today", "Tomorrow", and "Upcoming".
    • FlashList when performance becomes critical. In a crypto trading app with thousands of live-updating coins, FlashList provided smoother scrolling and better memory usage than FlatList.
My approach is to start simple and move to FlashList only when profiling shows a real performance bottleneck.

11. Animated API vs Reanimated 3
Answer:
For new projects, I default to Reanimated 3 because animations run on the UI thread and remain smooth even when the JavaScript thread is busy.
For example, in a ride-sharing app, I built draggable bottom sheets and map interactions using Reanimated because gesture performance was critical.
I still use the Animated API for simple fade-ins or opacity transitions where bringing in Reanimated would be unnecessary complexity.

12. Hermes is on by default. When would you disable it?
Answer:
Very rarely.
One production case was when a third-party financial SDK crashed only in Hermes-enabled release builds. After confirming the issue came from the vendor SDK and not our code, we temporarily disabled Hermes until the vendor released a fix.
Generally, I prefer keeping Hermes enabled because it improves startup performance and memory usage.

13. iOS archive works locally but fails on CI. What are the first three things you check?
Answer:
I approach CI failures systematically.
The goal is to identify differences between environments.

    1. Environment parity:  Xcode, Node, CocoaPods, and Ruby versions.
    2. Code signing : certificates, provisioning profiles, Team ID, and Fastlane configuration.
    3. Dependency consistency : Podfile.lock, package-lock.json, and installed package versions.
In my experience, most CI archive failures are caused by environment or signing differences rather than application code.

14. User reports the app crashes sometimes on launch. How do you investigate?
Answer:
I start by checking Crashlytics for stack traces and affected devices, then use Sentry breadcrumbs to see what happened before the crash.
For example, I once found a startup crash that only occurred on fresh installs because a value from AsyncStorage was undefined and was being parsed before initialization completed.
After identifying the pattern, I reproduced it locally, fixed the initialization flow, and added additional logging to prevent similar issues.

15. Tell me about a real bug that took more than a day to find.
Answer:
One of the most difficult bugs I've encountered involved authentication and app lifecycle state.

I had a production issue where users were randomly logged out.
Initially, we suspected token expiration, but backend logs showed authentication was working correctly.
After extensive debugging, we found a race condition between app startup, token refresh, and AsyncStorage hydration. Under slow network conditions, navigation checked authentication before storage restoration completed.
The fix was introducing a startup state machine and blocking navigation until hydration finished.
The lesson was that the hardest production bugs are usually race conditions and lifecycle issues rather than React Native itself.


16. Supabase RLS. Tell me about an RLS mistake that bit in production.
One issue I inherited was an RLS policy that allowed authenticated users to read all records because it only checked:
auth.role() = 'authenticated'
instead of verifying ownership.
The intention was for users to see only their own data, but in reality any logged-in user could access records belonging to other users.
The fix was to scope access using:
user_id = auth.uid()
and add automated RLS tests to verify that one user could never read another user's data.
The lesson was that "authenticated" does not mean "authorized". Every policy should explicitly enforce ownership or role-based access.

17. When should a write go through an Edge Function instead of direct table access?
I use direct client-to-table writes when the operation is simple and ownership can be enforced entirely through RLS.
Example:
Users creating their own profile, updating settings, or adding favorites.
RLS alone is enough.
I use an Edge Function when business logic, validation, or external integrations are involved.
Example:
In a subscription-based app, creating a premium plan purchase went through an Edge Function because we needed to:
    • Verify Stripe payment
    • Validate subscription status
    • Prevent client-side manipulation
If a write affects money, permissions, or multiple systems, I generally route it through an Edge Function.

18. One year later, product wants multiple favorite lists. How would you evolve the schema?
Originally I might have:
favorites
    • id
    • user_id
    • item_id
which works well for simple favorites.
For multiple lists, I would introduce:
favorite_lists
    • id
    • user_id
    • name
favorite_list_items
    • id
    • list_id
    • item_id
I would keep the existing data and migrate each user's current favorites into a default list called "Favorites".
The original schema wasn't wrong; it was optimized for the requirements at the time.
A good schema should be easy to evolve rather than trying to predict every future feature.

19. You inherit a codebase with class components, Redux Thunks, and no tests. Manager wants Zustand and hooks. What do you do this week?
I would not start by rewriting everything.
My first week would focus on understanding risk and creating a migration plan.
    1. Identify critical user flows.
    2. Add tests around the most important business logic.
    3. Introduce Zustand only for new features.
    4. Use hooks in new development.
    5. Leave stable legacy screens untouched initially.
To the team, I would say:
"We are not rewriting the app. We are creating a path forward. Every new feature follows the new architecture, and existing code gets migrated when business value justifies it."
Large rewrites often create bugs and delay delivery.
My goal is incremental modernization while keeping the product stable and shippable.
