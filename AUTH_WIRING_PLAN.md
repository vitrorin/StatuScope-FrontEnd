# Frontend Auth Wiring Plan — Firebase + Backend RBAC

> Scope: connect the existing `StatuScope-FrontEnd` (Expo + expo-router) to the
> already-implemented `StatusScope-Backend` Firebase auth + RBAC. The backend
> is treated as **frozen**; we change only what is strictly necessary on the
> backend side (one annotation removal) and do all the new work on the
> frontend.

---

## 1. Goal

Take the visual-only [`components/auth/Login.tsx`](components/auth/Login.tsx)
and turn it into a real authenticated entry point so that:

1. The user types `email + password`, the frontend signs in against
   **Firebase Auth** (browser/RN SDK), and obtains a Firebase **ID token**.
2. The frontend fetches the StatuScope user profile from
   `GET /auth/me` (the backend looks the user up by Firebase UID and returns
   their roles, privileges, hospital).
3. Every subsequent API request carries `Authorization: Bearer <idToken>`,
   auto-refreshed by the Firebase SDK.
4. Logged-in users land on the dashboard that matches their **server-side
   role** (not a role tab they picked on the login form).
5. Routes / sidebar items can be hidden via role/privilege guards driven by
   the data in `/auth/me`.
6. A `Register` screen calls `POST /auth/register` with an invite code, then
   signs the user into Firebase with the same credentials.
7. Logout calls `signOut(...)` and bounces to `/login`.

The whole flow mirrors the demo-quarkus pattern referenced in
[`LOGIN_RBAC_IMPLEMENTATION_PLAN.md`](../LOGIN_RBAC_IMPLEMENTATION_PLAN.md):
**no `/auth/login` endpoint** is called — login happens client-side against
Firebase, the backend only verifies tokens and serves user data.

---

## 2. Current state (verified)

### Backend (already wired — keep frozen)

| Concern | File | Notes |
|---|---|---|
| Firebase Admin init | [`infrastructure/firebase/FirebaseConfig.java`](../StatusScope-Backend/src/main/java/com/itesm/infrastructure/firebase/FirebaseConfig.java) | Reads service-account JSON, eager `@Startup` |
| Service account | [`src/main/resources/firebase-service-account.json`](../StatusScope-Backend/src/main/resources/firebase-service-account.json) | `project_id = proyecto-andres-d7931` — frontend must point at the same project |
| Auth filter | [`infrastructure/security/FirebaseAuthFilter.java`](../StatusScope-Backend/src/main/java/com/itesm/infrastructure/security/FirebaseAuthFilter.java) | Verifies ID token, loads user by `external_auth_id`, builds `CurrentUser` (id, uid, email, fullName, hospitalId, roles, privileges) |
| Public endpoints | — | Whitelisted: `auth/register`, `q/health`, `q/openapi` |
| `POST /auth/register` | [`AuthResource.java`](../StatusScope-Backend/src/main/java/com/itesm/interfaces/rest/AuthResource.java) | Body: `{ fullName, email, password, inviteCode }` → 201 with `UserSummaryDto` |
| `GET /auth/me` | [`AuthResource.java`](../StatusScope-Backend/src/main/java/com/itesm/interfaces/rest/AuthResource.java) | Returns `UserSummaryDto` (id, email, fullName, hospitalId, hospitalName, roles, privileges) |
| Admin endpoints | [`AdminHospitalResource`](../StatusScope-Backend/src/main/java/com/itesm/interfaces/rest/AdminHospitalResource.java), [`AdminUserResource`](../StatusScope-Backend/src/main/java/com/itesm/interfaces/rest/AdminUserResource.java), [`AdminRoleResource`](../StatusScope-Backend/src/main/java/com/itesm/interfaces/rest/AdminRoleResource.java) | All `@RequiresPrivilege(...)`-gated |
| Seeded reference data | [`import.sql`](../StatusScope-Backend/src/main/resources/import.sql) | Hospitals `HGZ-21` (`INVITE-HGZ21`) & `HRE-05` (`INVITE-HRE05`); roles `SYSTEM_ADMIN/HOSPITAL_ADMIN/DOCTOR`; placeholder seed users with fake `external_auth_id`s (NOT real Firebase UIDs — they cannot log in until replaced) |

### Frontend (visual only)

| Concern | File | Notes |
|---|---|---|
| Routing | [`app/`](app/) (Expo Router file-based) | `_layout.tsx` provides theme + Gluestack; `(tabs)/index.tsx` renders `<Login />`; `dashboard/[role].tsx` switches Doctor vs Admin dashboard from URL param |
| Login UI | [`components/auth/Login.tsx`](components/auth/Login.tsx) | Pure presentational; submit just calls `router.push('/dashboard/' + role)` — no fetch, no token, no real credentials |
| Form atoms | [`components/foundation/Button.tsx`](components/foundation/Button.tsx), [`components/inputs/InputField.tsx`](components/inputs/InputField.tsx), [`components/inputs/CheckboxField.tsx`](components/inputs/CheckboxField.tsx), [`components/inputs/RoleSegmentedControl.tsx`](components/inputs/RoleSegmentedControl.tsx) | Already in place; we will reuse them |
| Sidebar | [`components/Sidebar.tsx`](components/Sidebar.tsx) | Has a `onLogout` prop — currently unused; we'll wire it |
| Auth state | — | None |
| HTTP client | — | None — no `axios`/`fetch` calls anywhere yet (`grep` found 0 occurrences) |
| Firebase SDK | — | Not installed |

### Stack quirks that change the plan

The original [`LOGIN_RBAC_IMPLEMENTATION_PLAN.md`](../LOGIN_RBAC_IMPLEMENTATION_PLAN.md)
§6 assumed vanilla React 19 + Vite + react-router-dom. **This project is
Expo + React Native + expo-router**, so the wiring differs:

| Original plan said | This project actually uses |
|---|---|
| `react-router-dom` (`<BrowserRouter>`, `<Routes>`, `<ProtectedRoute>`) | `expo-router` (file-based; guard via `useRouter` + `useSegments` in `_layout.tsx`) |
| `import.meta.env.VITE_*` | `process.env.EXPO_PUBLIC_*` (Expo's public env-var convention; baked into the bundle at build time) |
| Browser-only `firebase/auth` with `indexedDB` persistence | `firebase/auth` works on web; on iOS/Android the SDK auto-uses the **AsyncStorage**-backed persistence when `@react-native-async-storage/async-storage` is present (already in `package.json`). No `initializeAuth(getReactNativePersistence(...))` boilerplate needed under modern `firebase` versions on Expo, but we must still import the right entry. |
| `axios` interceptors | We'll use a tiny `fetch` wrapper instead — one less dep, plays nicely with React Native, and the project doesn't ship `axios` today |

---

## 3. Backend: minimum-viable change

**One change**, otherwise frozen.

In [`AuthResource.java`](../StatusScope-Backend/src/main/java/com/itesm/interfaces/rest/AuthResource.java),
remove `@RequiresPrivilege("users.read")` from `GET /auth/me`. Reason: a
DOCTOR (per the seeded `role_privileges` distribution in `import.sql`) does
**not** have `users.read`, so a logged-in doctor currently gets 403 when
fetching their own profile. Reading your own identity should be implicit in
"is authenticated", which the filter already enforces.

After change:

```java
@GET
@Path("/me")
public Response me() {
    UserSummaryDto profile = getMyProfileUseCase.execute();
    return Response.ok(profile).build();
}
```

Nothing else on the backend gets touched.

---

## 4. Frontend implementation plan

### 4.1 Dependencies to add

```
firebase
```

That's it. We'll **avoid** `axios` (use `fetch`) and **avoid** `react-router-dom`
(use `expo-router`, which is already installed). `@react-native-async-storage/async-storage`
is already a dep, which Firebase Auth uses automatically for token persistence
on native. `react-hook-form` / `zod` are nice-to-have but optional and **not**
introduced in this plan to keep the diff minimal.

Install: `yarn add firebase` (or `npm install firebase`).

### 4.2 Firebase client config

Create `lib/firebase.ts`:

```ts
import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  // @ts-expect-error - getReactNativePersistence is a RN-only export not in firebase types
  getReactNativePersistence,
  Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:    process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  appId:     process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// On web, getAuth() defaults to IndexedDB persistence — fine.
// On native, we MUST initializeAuth() with AsyncStorage persistence, otherwise
// the SDK warns and falls back to in-memory (loses session on every app reload).
export const firebaseAuth: Auth =
  Platform.OS === 'web'
    ? getAuth(firebaseApp)
    : initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
```

The `getReactNativePersistence` import lacks a TS export (Firebase ships it
only at runtime for RN), hence the `@ts-expect-error`. `storageBucket` and
`messagingSenderId` are dropped from the config because they're only needed
for Storage / Cloud Messaging — Auth doesn't use them.

Add `.env` (gitignored) and `.env.example` (committed) at the project root:

```
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=proyecto-andres-d7931.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=proyecto-andres-d7931
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=proyecto-andres-d7931.appspot.com
EXPO_PUBLIC_FIREBASE_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

The `projectId` must match the backend service account
(`proyecto-andres-d7931`) — otherwise token verification will fail. The
remaining values come from the **Firebase Console → Project Settings → Web
app**. These are public client config, **not** secrets, but we still keep
them out of version control so different environments can override.

### 4.3 HTTP client with auto-token

Create `lib/api.ts`:

```ts
import { firebaseAuth } from './firebase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(public status: number, public code: string | undefined, message: string) {
    super(message);
  }
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const user = firebaseAuth.currentUser;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (user) {
    const token = await user.getIdToken();           // refreshes near expiry
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      // Stale or rejected token. Force a re-login.
      await firebaseAuth.signOut();
    }
    throw new ApiError(res.status, body?.code, body?.message ?? res.statusText);
  }

  return body as T;
}
```

This replaces the original plan's axios setup. We don't redirect from inside
the client — the `AuthContext` listener will see `currentUser` flip to `null`
and the route guard will bounce to `/login`.

### 4.4 `AuthContext`

Create `contexts/AuthContext.tsx`:

```tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  hospitalId: string | null;
  hospitalName: string | null;
  roles: string[];
  privileges: string[];
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  inviteCode: string;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;                     // initial auth restore + /auth/me round-trip
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPrivilege: (priv: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const me = await api<UserProfile & { roles: string[] | Set<string>; privileges: string[] | Set<string> }>('/auth/me');
          // backend returns Sets serialized as JSON arrays; normalize defensively
          setProfile({
            ...me,
            roles: Array.from(me.roles ?? []),
            privileges: Array.from(me.privileges ?? []),
          });
        } catch (e) {
          // Firebase token is valid but no DB row, or backend rejected. Sign out.
          await signOut(firebaseAuth);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    // onAuthStateChanged will populate the profile; await it via a one-shot promise
    return new Promise<UserProfile>((resolve, reject) => {
      const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
        if (!u) return;
        unsub();
        try {
          const me = await api<UserProfile>('/auth/me');
          setProfile(me);
          resolve(me);
        } catch (e) {
          await signOut(firebaseAuth);
          reject(e);
        }
      });
    });
  };

  const register = async (payload: RegisterPayload) => {
    await api<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return login(payload.email, payload.password);
  };

  const logout = async () => {
    await signOut(firebaseAuth);
  };

  const hasRole = (r: string) => !!profile?.roles?.includes(r);
  const hasPrivilege = (p: string) => !!profile?.privileges?.includes(p);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, login, register, logout, hasRole, hasPrivilege }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
```

### 4.5 Wire the provider + a route guard at the layout

Update [`app/_layout.tsx`](app/_layout.tsx):

```tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
// ...keep existing imports/wrappers

function AuthGate({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const onAuthScreen = segments[0] === 'login' || segments[0] === 'register';
    if (!profile && !onAuthScreen) {
      router.replace('/login');
    } else if (profile && onAuthScreen) {
      // already logged in — bounce to dashboard for their role
      const target = profile.roles.includes('SYSTEM_ADMIN') || profile.roles.includes('HOSPITAL_ADMIN')
        ? '/dashboard/administrator'
        : '/dashboard/doctor';
      router.replace(target);
    }
  }, [profile, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  // ...colorScheme etc.
  return (
    <GluestackUIProvider mode="dark">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AuthGate>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          </AuthGate>
        </AuthProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
```

We split `login` / `register` out as their own routes and let the
`(tabs)` group be the authenticated shell.

### 4.6 Move `Login` to its own route + wire submit

- Create `app/login.tsx` that renders `<Login />`.
- Repoint [`app/(tabs)/index.tsx`](app/(tabs)/index.tsx) to render the doctor
  dashboard (or a redirect), not the login screen.
- Update [`components/auth/Login.tsx`](components/auth/Login.tsx):
  - Lift email + password into local state (controlled `InputField`s).
  - Drop the `RoleSegmentedControl` (role is server-driven) — or keep it
    purely cosmetic and ignore its value.
  - On submit:
    ```tsx
    const { login } = useAuth();
    try {
      const me = await login(email, password);
      const dest = me.roles.includes('SYSTEM_ADMIN') || me.roles.includes('HOSPITAL_ADMIN')
        ? '/dashboard/administrator'
        : '/dashboard/doctor';
      router.replace(dest);
    } catch (e) {
      setError('Invalid email or password');   // generic; never leak which field was wrong
    }
    ```
  - Show an error banner above the form when `error` is set.
  - "Forgot my password?" stays a no-op for now (out of scope; covered in
    the original plan §8 hardening).

### 4.7 New `Register` screen

Create `app/register.tsx` that renders a `<RegisterForm />` we add at
`components/auth/RegisterForm.tsx`. Fields: `fullName`, `email`,
`password`, `confirmPassword`, `inviteCode`. Submit:

```tsx
const { register } = useAuth();
try {
  const me = await register({ fullName, email, password, inviteCode });
  router.replace('/dashboard/doctor');   // self-registration always lands as DOCTOR
} catch (e) {
  if (e instanceof ApiError && e.status === 400 && e.code === 'INVALID_INVITE') {
    setError('That invite code is not valid.');
  } else if (e instanceof ApiError && e.status === 409) {
    setError('That email is already registered.');
  } else {
    setError('Registration failed. Please try again.');
  }
}
```

A "Sign in" link at the bottom routes to `/login`.

### 4.8 Logout

Wire the existing `Sidebar.onLogout` (already a prop) by passing
`auth.logout` from the dashboards' parent and letting the gate's redirect
handle the rest:

```tsx
<Sidebar
  active="dashboard"
  onLogout={async () => {
    await logout();
    router.replace('/login');
  }}
  ...
/>
```

### 4.9 Role / privilege gating in admin UI

Add a small component:

```tsx
// components/auth/RoleGate.tsx
import { useAuth } from '@/contexts/AuthContext';

export function RoleGate({
  roles,
  privileges,
  fallback = null,
  children,
}: {
  roles?: string[];
  privileges?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { profile } = useAuth();
  if (!profile) return <>{fallback}</>;
  const roleOk = !roles || roles.some((r) => profile.roles.includes(r));
  const privOk = !privileges || privileges.some((p) => profile.privileges.includes(p));
  return roleOk && privOk ? <>{children}</> : <>{fallback}</>;
}
```

Wrap the user-management table card / hospitals link with
`<RoleGate roles={['HOSPITAL_ADMIN','SYSTEM_ADMIN']}>...</RoleGate>` so a
DOCTOR doesn't see admin affordances.

### 4.10 Don't add (out of scope, parking lot)

- Password reset flow.
- Email verification.
- "Remember me" toggle behavior — Firebase persists by default.
- Real Storybook integration of the new auth-aware components (Storybook
  config exists; revisit when we add tests).
- Replacing the seeded fake `external_auth_id`s in `import.sql` with real
  Firebase UIDs (handled separately — see §5 for the test path).

---

## 5. How to actually log in for the first time

The seeded users in [`import.sql`](../StatusScope-Backend/src/main/resources/import.sql)
have placeholder `external_auth_id`s (`seed-admin`, `seed-hadmin21`,
`seed-doc1`) that are **not** real Firebase UIDs, so they cannot log in.
End-to-end test path:

1. Start backend (`./mvnw quarkus:dev` from `StatusScope-Backend`).
2. Start frontend (`yarn web` or `yarn start` from `StatuScope-FrontEnd`).
3. Go to `/register` and submit:
   - `fullName: "Test Doctor"`
   - `email: testdoc@example.com`
   - `password: Password123!`
   - `inviteCode: INVITE-HGZ21`
4. Backend creates a Firebase user, gets a real UID, inserts the DB row
   with `roles=[DOCTOR]`, `hospitalId=HGZ-21`, returns 201.
5. Frontend immediately calls `signInWithEmailAndPassword(...)` → fetches
   `/auth/me` → routes to `/dashboard/doctor`.

Subsequent app starts: the Firebase SDK silently restores the session on
boot (AsyncStorage on native, IndexedDB on web), `onAuthStateChanged` fires,
`/auth/me` runs, the user lands on their dashboard without re-typing
credentials.

For an admin smoke test: in the Firebase Console, create a user manually
(`admin@statusscope.local` / `Password123!`), copy its UID, and update
[`import.sql`](../StatusScope-Backend/src/main/resources/import.sql) line
49 to set `external_auth_id` to that real UID. Restart Quarkus
(`drop-and-create` re-runs the script). Then log in.

---

## 6. Implementation order (smallest shippable steps)

1. **Backend one-liner.** Drop `@RequiresPrivilege("users.read")` on
   `GET /auth/me` so a logged-in DOCTOR can fetch their own profile.
2. **Firebase + env wiring.** Add `firebase` dep. Create
   `lib/firebase.ts`, `lib/api.ts`, `.env`, `.env.example`. App still
   does nothing different yet.
3. **`AuthContext` + provider mount.** Create `contexts/AuthContext.tsx`,
   wrap `app/_layout.tsx` with `<AuthProvider>`, do **not** add the gate
   yet. The app boots; `useAuth()` works.
4. **Login screen wiring.** Move `<Login />` to `app/login.tsx`, hook the
   submit button to `auth.login(...)`, route by role on success, surface a
   generic error on failure. Manual test against `/register`-created user.
5. **Auth gate.** Add the `<AuthGate>` redirect logic to `_layout.tsx`.
   Anonymous users get bounced to `/login`; logged-in users on `/login` get
   bounced to their dashboard.
6. **Register screen.** Add `app/register.tsx` + `RegisterForm`. Verify the
   self-registration path end-to-end against `INVITE-HGZ21`.
7. **Logout + sidebar wiring.** Plumb `auth.logout` into existing
   `<Sidebar onLogout=...>`.
8. **`RoleGate`.** Hide admin-only UI from doctors.
9. **Cleanup.** Delete the cosmetic role tabs from `Login.tsx` (or keep them
   but ignore their value — your call), confirm the app still builds for
   web + native, smoke-test on both.

Each step is independently mergeable; nothing in steps 2–9 touches the
backend.

---

## 8. Gaps caught on review (additions to the original plan)

These are the things the first pass missed. Fold them into the relevant
implementation step rather than treating them as a separate phase.

### 8.1 React Native persistence for Firebase Auth (folded into §4.2)

`getAuth()` works on web but on iOS/Android falls back to in-memory
persistence — every cold start would force a re-login and the SDK prints a
warning. The fix is `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`
behind a `Platform.OS !== 'web'` branch. The §4.2 snippet has been updated.
`@react-native-async-storage/async-storage` is already in `package.json`.

### 8.2 InputField is already controllable (no change needed)

I checked [`InputField`](components/inputs/InputField.tsx) — it already
exposes `value`, `onChangeText`, and `error`. The current Login.tsx is
*using it uncontrolled*; we just pass those props in §4.6. No new component
work.

### 8.3 Loading splash while `loading=true`

While `AuthProvider` is restoring the session and fetching `/auth/me`, the
gate currently returns `<>{children}</>`, which means the user briefly sees
the login screen even when they're about to be redirected to a dashboard
(or vice versa). Add a tiny splash:

```tsx
function AuthGate({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  // ...redirect logic unchanged...

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <>{children}</>;
}
```

### 8.4 Simplify `login()` — avoid double `/auth/me` fetch

The §4.4 snippet kicks off a *second* `onAuthStateChanged` listener inside
`login()`. Combined with the outer listener already in `AuthProvider`, the
profile gets fetched twice on a fresh sign-in. Replacement:

```tsx
const login = async (email: string, password: string) => {
  await signInWithEmailAndPassword(firebaseAuth, email, password);
  // The outer onAuthStateChanged will populate setProfile. We *also* fetch
  // here so callers can await the resolved profile and route on it.
  const me = await api<UserProfile>('/auth/me');
  setProfile({
    ...me,
    roles: Array.from(me.roles ?? []),
    privileges: Array.from(me.privileges ?? []),
  });
  return me;
};
```

The outer listener will still fire and run its own `api('/auth/me')`. To
deduplicate fully, gate the outer listener with a `useRef` flag set during
`login()`/`register()`. Optional — a single extra request on sign-in is not
worth complicating the lifecycle for.

### 8.5 Existing admin routes that should be wrapped with `RoleGate`

§4.9 introduces `RoleGate` but doesn't list which routes already exist that
need wrapping. Today these are admin-only and should be guarded:

- [`app/admin/analytics.tsx`](app/admin/analytics.tsx) → `roles: ['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']`
- [`app/admin/resources.tsx`](app/admin/resources.tsx) → same
- The "Users" sidebar item in [`components/Sidebar.tsx`](components/Sidebar.tsx) (key `'users'`) → wrap the nav item, not the page
- [`components/users/UserTableCard.tsx`](components/users/UserTableCard.tsx) when used inside a doctor view (it shouldn't render at all)

For pages, the simplest pattern is `RoleGate` at the top of each `.tsx`,
with `<Redirect href="/dashboard/doctor" />` as the `fallback`.

### 8.6 Native dev: `localhost` won't reach the backend

`EXPO_PUBLIC_API_URL=http://localhost:8080` works on web and iOS Simulator
but **not** on Android Emulator (`localhost` there points at the emulator
itself, not the host). For native dev the URL needs to be one of:

- Android Emulator: `http://10.0.2.2:8080`
- Physical device on same Wi-Fi: `http://<host-LAN-IP>:8080` (and Quarkus
  must bind to `0.0.0.0`, not `localhost` — already true by default)

Document this in the eventual `.env.example`. We don't need to solve it now
if we're demoing on web only.

### 8.7 Backend CORS (dev: already permissive, prod: tighten later)

[`application.properties:17`](../StatusScope-Backend/src/main/resources/application.properties#L17)
sets `quarkus.http.cors.origins=/.*/` which is fine for dev — the frontend
running at `http://localhost:8081` (Expo web default) or `http://localhost:19006`
will be allowed. Worth narrowing for prod, but **out of scope** for this
plan; flagging only so we don't forget.

### 8.8 `(tabs)` group is the authenticated shell

Architectural decision left implicit in §4.5 — making it explicit:

- **Outside the auth shell** (no token required to render): `app/login.tsx`, `app/register.tsx`.
- **Inside the auth shell** (`AuthGate` redirects to `/login` if no profile):
  everything in `app/(tabs)/`, `app/dashboard/`, `app/admin/`, `app/diagnosis.tsx`,
  `app/modal.tsx`.
- After the move in §4.6, `app/(tabs)/index.tsx` should render either the
  doctor dashboard directly or `<Redirect href="/dashboard/doctor" />`. The
  tabs themselves stay intact.

### 8.9 Env-var typing

`process.env.EXPO_PUBLIC_*` is `string | undefined` in TypeScript. The
updated §4.2 snippet uses non-null `!` assertions. If we want compile-time
safety, add `types/env.d.ts`:

```ts
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_FIREBASE_API_KEY: string;
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: string;
    EXPO_PUBLIC_FIREBASE_APP_ID: string;
  }
}
```

…and drop the `!`s. Optional; non-blocking.

### 8.10 `.gitignore`

Confirm `.env` is gitignored before committing anything (the apiKey is
public-by-design but the convention still holds, and other env files might
hold secrets later). Add `.env*` and keep `!.env.example`.

---

## 9. Open questions / decisions needed before / during implementation

1. **Firebase web app config values** — we need the public web-app
   credentials (apiKey, appId, senderId, storageBucket) from the
   `proyecto-andres-d7931` Firebase Console. The service-account JSON does
   not contain them.
2. **Native target?** The plan covers web + native. If we're shipping web
   only for the demo, we can skip the AsyncStorage check.
3. **Cosmetic role tabs on `Login.tsx`** — drop, or keep as visual fluff?
   The server, not the form, decides the user's role.
4. **Error UX** — single "Invalid email or password" string for any login
   failure (recommended; doesn't leak which field is wrong) vs. mapping
   each Firebase error code separately?
