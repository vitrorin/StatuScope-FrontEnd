import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute() {
  const { firebaseUser, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!firebaseUser) return <Navigate to="/login" replace />

  return <Outlet />
}
