export const firebaseApp = {};

export const firebaseAuth = {
  currentUser: {
    getIdToken: jest.fn(async () => 'mock-jwt-token'),
  },
  signOut: jest.fn(async () => undefined),
};
