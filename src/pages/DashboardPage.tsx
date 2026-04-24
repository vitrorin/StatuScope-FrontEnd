import { useAuth } from '../auth/AuthContext'
import App from '../App'

export default function DashboardPage() {
  const { profile, logout } = useAuth()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#1e293b', color: '#fff' }}>
        <span>
          <strong>{profile?.fullName}</strong>
          {profile?.hospitalName ? ` — ${profile.hospitalName}` : ''}
          {' '}
          <span style={{ opacity: 0.7 }}>({profile?.roles.join(', ')})</span>
        </span>
        <button onClick={logout} style={{ cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
      <App />
    </div>
  )
}
