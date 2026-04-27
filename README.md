# StatuScope — Frontend

Cross-platform (iOS, Android, Web) medical radar system for hospitals. Built with **Expo React Native**, **Expo Router**, and **NativeWind**.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [npm](https://www.npmjs.com/) (comes with Node) or [Yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) on your physical device **or** an Android/iOS emulator
- A running instance of the [StatusScope Backend](../StatusScope-Backend)

## 1. Clone & install dependencies

```bash
git clone <repo-url>
cd StatuScope-FrontEnd
npm install
```

## 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local   # if an example file exists, otherwise create it manually
```

Add your Firebase project credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

> You can find these values in your Firebase console under **Project Settings → General → Your apps**.

## 3. Run the app

```bash
npx expo start
```

Then choose how to open it:

| Key | Target |
|-----|--------|
| `a` | Android emulator |
| `i` | iOS simulator (macOS only) |
| `w` | Web browser |
| Scan QR | Expo Go on a physical device |

### Platform-specific shortcuts

```bash
npm run android   # open directly on Android emulator
npm run ios       # open directly on iOS simulator (macOS only)
npm run web       # open in the browser
```

## 4. Run tests

```bash
npx vitest
```

## 5. Run Storybook (component explorer)

```bash
npm run storybook           # web Storybook at http://localhost:6006
npm run storybook-generate  # regenerate story index after adding new stories
```

## Project structure

```
app/          ← file-based routes (Expo Router)
components/   ← UI components organised by domain
contexts/     ← React Context providers (auth, etc.)
constants/    ← design tokens and theme
lib/          ← shared utilities (api client, firebase init)
hooks/        ← custom React hooks
types/        ← shared TypeScript types
stories/      ← Storybook stories
```

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
