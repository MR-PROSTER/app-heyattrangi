# Profile Architecture

Production-hardened patient Profile module (`/patient/profile`).

## Routes

| URL | Surface |
|-----|---------|
| `/patient/profile` | Profile settings shell |
| `/patient/profile#identity` | Deep link → Identity |
| `/patient/profile#membership` | Deep link → Membership |
| `/patient/profile#emergency` | Deep link → Emergency (committed tier only) |
| `/patient/profile#mind-matrix` | Deep link → Mind Matrix |
| `/patient/profile#preferences` | Deep link → Preferences |
| `/patient/profile#privacy` | Deep link → Privacy & Consent |
| `/patient/profile#account` | Deep link → Account |
| `/privacy` | Privacy Policy (read-only page) |
| `/terms` | Terms of Service (read-only page) |

### Invalid hash recovery

| Input | Result |
|-------|--------|
| Empty / missing hash | Stay at top; default active nav = Identity |
| Unknown `#…` | Scroll to top; hash cleared |
| `#emergency` when not committed | Scroll to top; hash cleared |

Deep links smooth-scroll and briefly highlight the section (`.profile-section-flash`).

## Folder structure

```
components/profile/
  ProfileSettings.tsx          # Shell entry
  ProfileProvider.tsx          # Single shell state + deep links
  ProfileErrorBoundary.tsx
  ProfileSkeletons.tsx
  profileNav.tsx               # Nav item definitions
  PersonalInfoSection.tsx      # Identity bridge
  identity/                    # IdentityCard + field primitives
  membership/                  # MembershipCard + badge/timeline
  emergency/                   # EmergencyContactCard (gated)
  mind-matrix/                 # MindMatrixCard + history (lazy)
  preferences/                 # PreferencesCard (lazy)
  privacy/                     # PrivacyConsentCard (lazy)
  account/                     # AccountActions + Delete dialog (lazy)
  ui/                          # ProfileCard, Header, Divider, …
  BillingSection.tsx           # Existing billing (unchanged)
  VideoSettingsSection.tsx     # Existing video prefs
  CreditsSection.tsx           # Dev credits

lib/profile/
  sections.ts                  # Section IDs + hash parse
  verifyProfileDeepLinks.ts    # Smoke checks

docs/
  Profile Architecture.md      # This file
```

## Component tree

```
PatientProfilePage
  ProfileSettings
    ProfileErrorBoundary
      ProfileProvider
        ProfileShell
          Nav (desktop + mobile)
          PersonalInfoSection → IdentityCard
          MembershipCard + Billing + Video
          [gated] EmergencyContactCard
          [lazy] MindMatrixCard
          [lazy] PreferencesCard
          [lazy] PrivacyConsentCard
          [lazy] AccountActionsCard
            SignOutCard
            DeleteAccountCard → [lazy] DeleteAccountDialog
```

## State flow

1. **ProfileProvider** holds shell state only:
   - `isSaving` / save status
   - `activeSection` (IntersectionObserver + nav)
   - `identitySnapshot` + `emergencyFields` (so PATCH payloads stay consistent)
   - membership gating (`showEmergency`)
   - deep-link scroll / highlight
2. **Identity / Emergency / Preferences** keep local draft UI state.
3. **Saves** call existing `/api/profile/patient` (or localStorage for phone / relationship / preferences).
4. **`useProfile()`** replaces prop drilling for shell concerns.

## Data flow

| Surface | Persistence |
|---------|-------------|
| Name / age / gender / emergency name+phone | `PATCH /api/profile/patient` |
| Avatar | `POST /api/profile/patient/upload-photo` |
| Identity phone / emergency relationship | `localStorage` (no API field yet) |
| Preferences | `localStorage` (`heyattrangi_preferences_{userId}`) |
| Mind Matrix history | Presentation data (`data/mindMatrixProfile.ts`) |
| Consent display | Derived from patient/user `createdAt` |
| Sign out / delete success | `performClientSignOut()` → `/auth` |

## Performance

- Lazy: Mind Matrix, Preferences, Privacy, Account, Delete dialog, Video settings.
- Skeletons while chunks load.
- `memo(MembershipCard)`.
- Section error boundaries isolate failures (avatar, Mind Matrix, etc.).

## Accessibility

- Focus rings on nav, fields, dialogs.
- Delete dialog: focus trap, Escape, restore focus.
- Identity field: focus restored to display control after Save/Cancel.
- Reduced motion: Framer `useReducedMotion` + `.pref-reduce-motion` + flash outline fallback.
- Deep-link highlight respects `prefers-reduced-motion`.

## Responsive checklist

Verified layout targets: **320 / 375 / 768 / 1024 / 1440 / 1920**.  
Shell uses `max-w-[1000px]`, stacked cards on small screens, sticky-feel horizontal nav chips on mobile.

## Extension guide

1. **New section** — add id to `lib/profile/sections.ts`, nav item in `profileNav.tsx`, render under `ProfileShell`, optional lazy + skeleton + error boundary.
2. **New preference** — extend `preferenceStorage.ts` defaults + Preferences UI; keep local-only unless API exists.
3. **Wire phone / relationship to API** — extend patient PATCH; remove localStorage fallbacks carefully.
4. **Deep link** — section `id` attribute must match `ProfileSectionId`.

## Verification

```bash
npx tsx lib/profile/verifyProfileDeepLinks.ts
npx tsc --noEmit
```

Manual QA: Identity edit, Membership, Emergency gating (FREE vs PREMIUM), Mind Matrix empty/history, Preferences persist reload, Privacy links, Sign Out, Delete `DELETE` confirm, invalid `#foo`, Google vs email accounts (auth provider inference).
