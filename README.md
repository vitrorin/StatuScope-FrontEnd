# StatuScope - Frontend

Cross-platform medical radar frontend for StatuScope. Built with Expo React Native, Expo Router, Firebase Authentication, and a typed REST API client that talks to the StatusScope backend.

## Current Stack

| Area | Technology |
| --- | --- |
| Runtime | Expo `~54.0.34`, React Native `0.81.5`, React `19.1.0` |
| Routing | Expo Router `~6.0.23` |
| Authentication | Firebase JS SDK `^12.12.1` |
| Styling | React Native StyleSheet, NativeWind, Gluestack UI utilities, centralized tokens in `constants/theme.ts` |
| Internationalization | `i18next`, `react-i18next`, local files in `i18n/locales` |
| UI review | Storybook `10.3.x` |
| Testing | Vitest, Cypress, Storybook test tooling, TypeScript |

## Prerequisites

- Node.js 18 or later
- npm or Yarn
- Expo Go, an emulator, or a web browser
- A running StatusScope backend
- Firebase web app credentials

## Setup

```bash
git clone <repo-url>
cd StatuScope-FrontEnd
npm install
```

Create `.env` from `.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080

EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Firebase web credentials are available in Firebase Console under Project Settings > General > Your apps.

For native devices, `localhost` points to the device itself. Use the machine LAN IP in `EXPO_PUBLIC_API_URL` when testing on a physical phone.

## Run

```bash
npm run start
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
npm run test
npm run test:coverage
npm run cy:run
npm run cy:e2e
npm run cy:open
npm run storybook
npm run build-storybook
npm run docker:build
```

`serve:dist` serves the exported web build on port `4173`.
`cy:e2e` builds the web app, starts a temporary local static server for `dist`, runs Cypress against that production-like build, and stops the server automatically.

## Validate

```bash
npm run lint
node ./node_modules/typescript/bin/tsc --noEmit
npm test
npm run test:coverage
npm run cy:e2e
npm run build-storybook
```

Recently verified:

- `node ./node_modules/typescript/bin/tsc --noEmit` passes without errors.
- `npm run cy:e2e` passes with 8 specs and 28 E2E tests.

### Testing Strategy

Jest is used for unit and integration tests under `__tests__`. These tests validate reusable components, hooks, contexts, API clients, i18n helpers, design tokens, and view-level behavior with mocked dependencies. Coverage can be generated with `npm run test:coverage`; the report is written to `coverage/lcov-report/index.html`.

Cypress is used for browser E2E tests under `cypress/e2e`. The preferred command is `npm run cy:e2e` because it performs the full E2E cycle in one step: it exports the Expo web build, serves the generated `dist` folder from a temporary local server, runs Cypress in headless mode against that URL, and then stops the server. This avoids having to manually run `npm run build:web`, `npm run serve:dist`, and `npm run cy:run` separately.

Current Cypress specs:

| Spec | Scope |
| --- | --- |
| `01-login.cy.ts` | Login rendering, brand copy, validation errors, invalid credentials, and navigation to registration |
| `02-register.cy.ts` | Registration rendering, required fields, password validation, password mismatch, and navigation back to login |
| `03-routing.cy.ts` | Protected route redirects for unauthenticated users |
| `04-responsive.cy.ts` | Responsive checks for login and registration at desktop and tablet widths |
| `05-doctor-dashboard-screenshots.cy.ts` | Mocked authenticated doctor dashboard visual coverage and screenshots |
| `06-doctor-diagnosis-screenshots.cy.ts` | Mocked authenticated diagnosis screen visual coverage and screenshots |
| `07-main-authenticated-flows.cy.ts` | Main authenticated screens for doctor, hospital admin, and system admin |
| `08-doctor-diagnosis-flow.cy.ts` | Functional diagnosis flow: required fields, evaluation creation, AI response, and clean restart of an unconfirmed report |

The project also includes Cypress specs in `cypress/e2e` and Storybook stories in `stories`.

## Application Areas

### System Administrator

Platform-wide area for `SYSTEM_ADMIN` users. These routes are protected with `RoleGate` and the `isSystemAdmin` privilege.

| Route | Purpose |
| --- | --- |
| `/system/dashboard` | Global platform overview, KPIs, regional distribution, activity, hospital status, and outbreak context |
| `/system/users` | Global users and roles management across all hospitals |
| `/system/hospitals` | Hospital registration, editing, activation, and deactivation |

System administrators are redirected to `/system/dashboard` after login.

### Hospital Administrator

Hospital-scoped area for `HOSPITAL_ADMIN` users. These screens consume `admin.operations` APIs and do not grant system-wide access.

| Route | Purpose |
| --- | --- |
| `/dashboard/administrator` | Hospital operations dashboard |
| `/admin/analytics` | Hospital-scoped epidemiological analytics |
| `/admin/resources` | Beds, ICU, oxygen, isolation, staffing, inventory, and supply requests |
| `/admin/recommendations` | Operational recommendations, task assignment, notifications, supply requests, and status workflow |
| `/admin/users` | Hospital users and operational contact directory |

Hospital administrators are redirected to `/dashboard/administrator` after login.

### Doctor

Doctor-facing area for `DOCTOR` users.

| Route | Purpose |
| --- | --- |
| `/dashboard/doctor` | Doctor dashboard with epidemiological summary, alerts, metrics, and maps |
| `/analytics` | Disease analytics with municipal/state scope, trend windows, map overlays, and state drill-down |
| `/diagnosis` | Diagnosis evaluation workflow and AI-assisted clinical support |

Doctors are redirected to `/dashboard/doctor` after login.

## Authentication And Authorization

The frontend uses Firebase Authentication for sign-in and then asks the backend for the authoritative application profile.

1. User signs in with Firebase email/password.
2. Firebase returns an ID token.
3. `lib/api.ts` attaches `Authorization: Bearer <token>` to backend requests.
4. `GET /auth/me` returns roles, privileges, status, and hospital context.
5. `AuthContext` stores the profile and exposes helper methods.

Important files:

```text
contexts/AuthContext.tsx
lib/firebase.ts
lib/api.ts
components/auth/RoleGate.tsx
app/_layout.tsx
components/auth/Login.tsx
```

`RoleGate` protects route shells and selected views. Backend privilege checks remain the security boundary.

## Project Structure

```text
app/                         Expo Router routes
assets/                      Static images, maps, fonts, and icons
components/auth/             Login, registration, role gates
components/dashboard/        Shared dashboard widgets and map primitives
components/diagnosis/        Diagnosis-specific UI elements
components/feedback/         Banners and feedback states
components/foundation/       Base controls such as buttons, badges, avatars
components/inputs/           Form controls
components/layout/           Dashboard shell and top header
components/patterns/         Reusable composite UI patterns
components/views/admin/      Hospital administrator screens
components/views/doctor/     Doctor screens
components/views/system/     System administrator screens
constants/theme.ts           Design tokens and semantic colors
contexts/                    React context providers
i18n/                        English and Spanish translations
lib/                         API clients and shared utilities
stories/                     Storybook stories
__tests__/                   Unit and integration tests
cypress/                     Browser E2E and screenshot specs
```

## API Clients

| File | Backend area |
| --- | --- |
| `lib/api.ts` | Shared fetch wrapper, token injection, normalized errors |
| `lib/systemAdmin.ts` | `/system/dashboard`, `/admin/hospitals`, system user management |
| `lib/adminUsers.ts` | `/admin/users` legacy/simple admin-user operations |
| `lib/adminOperational.ts` | `/admin/dashboard`, `/admin/recommendations`, `/admin/resources`, operational contacts/groups |
| `lib/doctorDashboard.ts` | `/doctor/dashboard/*` and `/admin/epidemiology/*` |
| `lib/diagnosisAssistant.ts` | `/diagnosis/assistant/*` |
| `lib/diagnosisEvaluation.ts` | `/diagnosis/evaluations/*` |
| `lib/diagnosisDiseases.ts` | `/diagnosis/diseases` |

## Design And UX Notes

- Screens use `DashboardLayout` and shared sidebar/top-header patterns.
- System admin has a separate sidebar and route area from hospital admin.
- Hospital admin users include operational directory management; system admin users focus on global user/role/hospital governance.
- Loading states use skeletons for dashboards, users, resources, recommendations, and system screens.
- Text is localized through `i18n` and helper functions such as `translateDiseaseName` and `translateDashboardValue`.
- Colors should come from `constants/theme.ts` instead of hardcoded values.

## Documentation Notes

- `ARCHITECTURE.md` and `PROJECT_STRUCTURE.md` may contain older planning-era details and should be refreshed before using them as final documentation.
- `AUTH_WIRING_PLAN.md` is historical planning material. Treat `AuthContext`, `RoleGate`, and the current routes as the source of truth.
- Storybook documentation lives in `STORYBOOK_SETUP.md` and `STORYBOOK_QUICK_START.md`.
