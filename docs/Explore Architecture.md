# Explore Architecture

Production-hardened Explore module for patient Journey / Library.

## Routes

| URL | Surface |
|-----|---------|
| `/patient/library` | Explore hub (default Activities) |
| `/patient/library?mode=activities\|read\|listen\|assessments` | Tab (URL is source of truth) |
| `/patient/library?category=breathing\|…` | Activities category filter |
| `/patient/library?mode=read&item={slug}` | Article detail |
| `/patient/library?mode=listen&item={slug}` | Listen player |
| `/dashboard/explore?item={slug}` | Activity detail → session → completion |

### Invalid URL recovery

| Input | Result |
|-------|--------|
| Unknown `mode` | Activities |
| Unknown `category` | All |
| Unknown read/listen `item` | Hub with that mode, no item |
| Unknown activity `item` | Redirect `/patient/library` |

## Folder structure

```
components/patient/library/
  SelfExploreHome.tsx          # Hub UI
  explore/
    ExploreProvider.tsx        # Single hub state (URL + session recently-read)
    ExploreErrorBoundary.tsx
    ExploreSkeletons.tsx
    ExploreTabSwitcher.tsx
    ExploreCategoryChips.tsx
    ActivityGrid.tsx / ActivityCard.tsx / …
    assessments/               # Mind Matrix card only
    read/                      # Articles + detail + progress
    listen/                    # Tracks + audio player + mini player
    detail/                    # Activity detail
    session/                   # SessionRecorder shell
    engines/                   # Breathing, Grounding, … (lazy)
    completion/                # Post-session completion

data/
  exploreActivities.ts
  readArticles.ts
  listenContent.ts
  assessmentState.ts
  activities/                  # Engine configs + completion copy

lib/explore/
  urlState.ts                  # Parse / build / validate query state
  verifyUrlState.ts            # Smoke checks for URL helpers
```

## Component tree (hub)

```
LibraryPage
  ListenPlayerProvider
    ExploreProvider
      SelfExploreHome
        RecommendedSection
        ExploreTabSwitcher
        [lazy] Activities | Read | Listen | Assessments
      (optional) ArticleDetail | ListenPlayerScreen
      MiniPlayer
```

## Data flow

1. **URL → ExploreProvider** parses `mode`, `category`, `item`.
2. **UI actions → URL** via `router.replace` / `router.push` (`buildExploreHref`).
3. **Activities** navigate to `/dashboard/explore?item=`.
4. **Session / completion** keep local view state (intentional — not URL).
5. **Recently read** — session memory in ExploreProvider.
6. **Recently played** — session memory in ListenPlayerContext.

## State management

- **Single hub source:** `ExploreProvider` + `lib/explore/urlState.ts`
- **Audio:** `ListenPlayerContext` (media concerns stay isolated)
- Avoid prop drilling for tab/category; panels read `useExplore()` / local props only where needed

## Performance

- Dynamic import: Read / Listen / Assessments panels
- Dynamic import: activity engines inside `ActivityRenderer`
- Dynamic import: `SessionRecorder`, `CompletionPage`, article/listen detail screens
- Memoized `ActivityGrid`
- Animations respect `prefers-reduced-motion`

## Extensibility

| Add… | Do… |
|------|-----|
| Activity | Entry in `exploreActivities.ts` + config under `data/activities/` |
| Article | Entry in `readArticles.ts` |
| Listen track | Entry in `listenContent.ts` (tab auto-hides if zero available) |
| Assessment | New card + state in assessments/ (Phase 9 is Mind Matrix only) |
| Engine | Register in `ActivityRenderer` + `resolveActivityEngine` |

## Empty states

- **Read / Listen** tabs hidden when published items length is 0
- **Assessments** always shows Mind Matrix card states (never / taken / locked)
- No “Coming Soon” placeholders in Explore

## Accessibility

- Tablist / option roles on switcher and chips
- Focus rings on interactive controls
- Session: Space pause, Escape exit
- Screen-reader labels on players and progress
- Reduced-motion: CSS + Framer guards

## Verify

```bash
npx tsx lib/explore/verifyUrlState.ts
npx tsc --noEmit
```
