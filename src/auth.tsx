import { jwt_decode } from 'jwt-decode'

export function isTokenValid(): boolean {
  const token = localStorage.getItem('token')
  if (!token) return false

  try {
    const decoded: any = jwt_decode(token)
    const now = Date.now() / 1000  // sekunder
    return decoded.exp && decoded.exp > now
  } catch {
    return false
  }
}