const auth = {
  currentUser: {
    getIdToken: jest.fn(async () => 'mock-jwt-token'),
  },
  signOut: jest.fn(async () => undefined),
};

export type Auth = typeof auth;

export function getAuth() {
  return auth;
}

export function initializeAuth() {
  return auth;
}

export function getReactNativePersistence() {
  return {};
}

export const signOut = jest.fn(async () => undefined);
export const signInWithEmailAndPassword = jest.fn(async () => ({ user: auth.currentUser }));
export const onAuthStateChanged = jest.fn((_auth: Auth, callback: (user: Auth['currentUser'] | null) => void) => {
  callback(auth.currentUser);
  return jest.fn();
});
