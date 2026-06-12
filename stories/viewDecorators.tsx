import React from 'react';
import { AuthContext, createMockAuthValue, UserProfile } from '../.storybook/mocks/AuthContext';

export function withMockProfile(profile: UserProfile | null) {
  return (Story: React.ComponentType) => (
    <AuthContext.Provider value={createMockAuthValue(profile)}>
      <Story />
    </AuthContext.Provider>
  );
}
