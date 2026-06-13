# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start dev server (choose a/i/w in terminal for Android/iOS/Web)
npx expo start

# Platform-specific shortcuts
npm run android
npm run ios
npm run web

# Lint
npm run lint

# Run all tests (Storybook stories via Vitest + Playwright/Chromium)
npx vitest

# Storybook component explorer
npm run storybook           # web UI at http://localhost:6006
npm run storybook-generate  # regenerate story index after adding new story files
```

## Environment setup

Create `.env.local` with Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_API_URL=http://localhost:8080   # backend base URL (defaults to localhost:8080)
```

## Architecture

### Route → View split

Route files in `app/` are thin shells — each renders exactly one view component from `components/views/` and nothing else. All state, layout, and composition live in the view. This is intentional; do not add business logic to route files.

```
app/                        ← Expo Router file-based routes
components/views/
├── doctor/                 ← Doctor-role views (dashboard, diagnosis, analytics)
└── admin/                  ← Admin-role views (dashboard, users, analytics, recommendations, resources)
```

### AuthGate & protected routing (`app/_layout.tsx`)

The root layout wraps everything in `<GluestackUIProvider>` → `<I18nProvider>` → `<AuthProvider>` → `<AuthGate>`. `AuthGate` runs on every navigation segment change:

- Not authenticated + not on `login`/`register` → redirect to `/login`
- Authenticated + on `login`/`register` → redirect to `/dashboard/<role>` (derived from `profile.roles`)
- `loading === true` → render `ActivityIndicator`, no redirect

### `AuthContext` (`contexts/AuthContext.tsx`)

The single source of truth for auth state. Exposes:

```typescript
{ firebaseUser, profile, loading, login, register, logout, hasRole, hasPrivilege }
```

- `login()` calls Firebase `signInWithEmailAndPassword`, then fetches `/auth/me` to populate `profile`.
- `register()` calls `POST /auth/register` (invite code required), then calls `login()`.
- `onAuthStateChanged` re-hydrates the session on mount; if `/auth/me` fails, signs out and clears state.
- Use `hasRole('DOCTOR')` / `hasPrivilege('users.manage')` for guards — do not read `profile.roles` directly in components.

### `RoleGate` (`components/auth/RoleGate.tsx`)

Declarative component for conditional rendering by role. Use it instead of inline role checks:

```tsx
<RoleGate roles={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
  <AdminOnlySection />
</RoleGate>
```

### Dynamic role dashboard (`app/dashboard/[role].tsx`)

The `[role]` segment is validated against the authenticated user's actual role at runtime. If mismatched, it redirects to the correct dashboard — URLs are self-healing.

### API client (`lib/api.ts`)

All backend calls go through `api<T>(path, init?)`. It:
- Injects `Authorization: Bearer <token>` (auto-refreshed from Firebase)
- Sends `Accept-Language` from the active i18n language
- On 401 → auto sign-out
- On errors → throws `ApiError` with `.status` and `.code` fields matching backend error codes (e.g. `INVALID_INVITE`)

Never call `fetch` directly — always use `api()`.

### Firebase persistence (`lib/firebase.ts`)

On native (iOS/Android) Firebase Auth uses `AsyncStorage` for persistence. On web it uses the default in-memory persistence. The `firebaseAuth` export is the singleton `Auth` instance used everywhere.

### Styling

- **NativeWind 4** (Tailwind CSS for RN) for utility classes
- **Gluestack UI** for base primitives (`components/ui/`)
- Design tokens in `constants/theme.ts` (colors, fonts). Brand primary is `#0003B8`.
- Tailwind color palette is CSS-variable-backed (see `tailwind.config.js`) — use semantic names like `bg-primary-500`, `text-error-600` rather than raw hex values.

### Internationalisation

`i18n/` handles language detection from device locale. Supported: `en`, `es` (fallback `en`). The `<I18nProvider>` wraps the whole app. `getCurrentLanguage()` from `i18n/language.ts` returns the active locale string, injected as `Accept-Language` in every API call.

### Testing

Tests are Storybook stories executed via Vitest + `@storybook/addon-vitest`. Story files live in `stories/`. To add coverage for a new view, create a story in `stories/` and run `npm run storybook-generate`. Vitest runs stories headlessly in Chromium via Playwright — there is no separate unit test runner.
