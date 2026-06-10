import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AuthContext, AuthContextValue, UserProfile } from '@/contexts/AuthContext';
import { RegisterForm } from '@/components/auth/RegisterForm';

const profile: UserProfile = {
  id: 'usr_storybook',
  email: 'doctor@statuscope.test',
  fullName: 'Dr. Elena Ruiz',
  hospitalId: 'hosp_001',
  hospitalName: 'Central Hospital',
  roles: ['DOCTOR'],
  privileges: ['diagnosis:read', 'diagnosis:write'],
};

const authValue: AuthContextValue = {
  firebaseUser: null,
  profile: null,
  loading: false,
  login: async () => profile,
  register: async () => profile,
  logout: async () => undefined,
  hasRole: (role) => profile.roles.includes(role),
  hasPrivilege: (privilege) => profile.privileges.includes(privilege),
  isAdmin: () => false,
  isSystemAdmin: () => false,
};

const meta = {
  title: 'Components/auth/RegisterForm',
  component: RegisterForm,
  decorators: [
    (Story) => (
      <AuthContext.Provider value={authValue}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RegisterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
