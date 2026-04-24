export interface UserProfile {
  id: string
  email: string
  fullName: string
  hospitalId: string | null
  hospitalName: string | null
  roles: string[]
  privileges: string[]
}
