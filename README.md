# StatuScope - Frontend

Cross-platform medical radar system for hospitals. Built with **Expo React Native**, **Expo Router**, and Firebase Authentication.

## Prerequisites

- Node.js 18 or later
- npm or Yarn
- Expo Go, an emulator, or a web browser
- A running instance of the StatusScope Backend

## Setup

```bash
git clone <repo-url>
cd StatuScope-FrontEnd
npm install
```

Create a local environment file:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080

EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Firebase web credentials are available in Firebase Console under Project Settings > General > Your apps.

## Run

```bash
npx expo start
```

Then choose a target:

| Key | Target |
| --- | --- |
| `a` | Android emulator |
| `i` | iOS simulator |
| `w` | Web browser |
| QR | Expo Go on a physical device |

Useful scripts:

```bash
npm run start
npm run android
npm run ios
npm run web
npm run build:web
npm run serve:dist
npm run lint
npm run cy:run
npm run cy:open
npm run storybook
npm run build-storybook
npm run docker:build
```

## Test

```bash
npx vitest
node ./node_modules/typescript/bin/tsc --noEmit
```

Current known type-check gaps outside the latest system-admin work:

- `__tests__/unit/lib/doctorDashboard.test.ts` imports `radiusQuery`, which is not exported.
- `stories/compositions/TopHeader.stories.tsx` still passes the removed `searchPlaceholder` prop.

The production web export currently passes with `npm run build:web`.

`serve:dist` serves the exported web build on port `4173`. Cypress, Storybook, lint, and Docker scripts are available in `package.json` for local QA and UI review.

## App Areas

### System Administrator

Dedicated platform-wide area for `SYSTEM_ADMIN` users:

| Route | Purpose |
| --- | --- |
| `/system/dashboard` | Global platform overview, KPIs, user activity, regional distribution, hospital status, and outbreak/security context |
| `/system/users` | Global Users & Roles management across all hospitals |
| `/system/hospitals` | Hospital registration, editing, activation, and deactivation |

System administrators are redirected to `/system/dashboard` after login.

System admin pages are protected with `RoleGate` for `SYSTEM_ADMIN`. Some hospital-admin screens also allow `SYSTEM_ADMIN` because the backend gives system administrators platform-wide privileges.

### Hospital Administrator

Hospital-scoped area for `HOSPITAL_ADMIN` users:

| Route | Purpose |
| --- | --- |
| `/dashboard/administrator` | Hospital operations dashboard |
| `/admin/analytics` | Epidemiological analytics |
| `/admin/resources` | Hospital resources, inventory, staffing, and supply requests |
| `/admin/recommendations` | Operational recommendations, tasks, notifications, and supply requests |
| `/admin/users` | Hospital users and operational contact directory |

Hospital administrators are redirected to `/dashboard/administrator` after login.

### Doctor

Doctor-facing area for `DOCTOR` users:

| Route | Purpose |
| --- | --- |
| `/dashboard/doctor` | Doctor dashboard |
| `/analytics` | Disease analytics |
| `/diagnosis` | Diagnosis assistant |

Doctors are redirected to `/dashboard/doctor` after login.

Doctor analytics and dashboard screens consume the expanded `/doctor/dashboard/*` API: summary, metrics, local/state maps, state outbreak drill-down, alerts, local/state disease breakdowns, and reports.

## Important Frontend Modules

```text
app/                         Expo Router routes
components/dashboard/        Shared sidebar/navigation helpers
components/layout/           Dashboard shell and top header
components/views/doctor/     Doctor screens
components/views/admin/      Hospital administrator screens
components/views/system/     System administrator screens
contexts/                    Auth context
i18n/                        English/Spanish language support
lib/                         API clients and shared utilities
```

System admin API calls live in:

```text
lib/systemAdmin.ts
```

Hospital operational API calls live in:

```text
lib/adminOperational.ts
```

Doctor dashboard calls live in:

```text
lib/doctorDashboard.ts
```

Diagnosis assistant and evaluation calls live in:

```text
lib/diagnosisAssistant.ts
lib/diagnosisEvaluation.ts
lib/diagnosisDiseases.ts
```

## Design Notes

- Screens use the existing `DashboardLayout` and sidebar patterns.
- System admin has its own sidebar with only Dashboard, Users & Roles, and Hospitals.
- Hospital admin Users keeps the operational directory; system admin Users intentionally does not.
- Skeleton states are used for loading dashboards, users, resources, and system admin screens.
- Text is handled in Spanish/English using the existing i18n helpers and local language state.
