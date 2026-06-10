import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { RoleGate } from '@/components/auth/RoleGate';
import { AuthContext, AuthContextValue, UserProfile } from '@/contexts/AuthContext';

const adminProfile: UserProfile = {
  id: 'admin_storybook',
  email: 'admin@statuscope.test',
  fullName: 'Hospital Admin',
  hospitalId: 'hosp_001',
  hospitalName: 'Central Hospital',
  roles: ['HOSPITAL_ADMIN'],
  privileges: ['resources:write', 'users:read'],
};

const authValue: AuthContextValue = {
  firebaseUser: null,
  profile: adminProfile,
  loading: false,
  login: async () => adminProfile,
  register: async () => adminProfile,
  logout: async () => undefined,
  hasRole: (role) => adminProfile.roles.includes(role),
  hasPrivilege: (privilege) => adminProfile.privileges.includes(privilege),
  isAdmin: () => true,
  isSystemAdmin: () => false,
};

const meta = {
  title: 'Components/auth/RoleGate',
  component: RoleGate,
  decorators: [
    (Story) => (
      <AuthContext.Provider value={authValue}>
        <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
          <Story />
        </View>
      </AuthContext.Provider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RoleGate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllowedByRole: Story = {
  args: {
    roles: ['HOSPITAL_ADMIN'],
    fallback: <Text>Access denied</Text>,
    children: <Text>Visible admin content</Text>,
  },
};

export const AllowedByPrivilege: Story = {
  args: {
    privileges: ['resources:write'],
    fallback: <Text>Access denied</Text>,
    children: <Text>Visible resource action</Text>,
  },
};

export const Denied: Story = {
  args: {
    roles: ['SYSTEM_ADMIN'],
    fallback: <Text>Access denied</Text>,
    children: <Text>Hidden system content</Text>,
  },
};
