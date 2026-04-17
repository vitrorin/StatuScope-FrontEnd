import LoginCard from './LoginCard'

export default {
  title: 'StatusScope/LoginCard',
  component: LoginCard,
  parameters: {
    layout: 'centered',
  },
}

export const DoctorLogin = {
  args: {
    defaultRole: 'doctor',
  },
}

export const AdminLogin = {
  args: {
    defaultRole: 'admin',
  },
}
