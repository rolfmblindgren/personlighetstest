// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

function isTokenValid(): boolean {
  const token = localStorage.getItem("token")
  if (!token) return false

  try {
    const decoded: any = jwtDecode(token)
    const now = Date.now() / 1000
    return decoded.exp && decoded.exp > now
  } catch {
    return false
  }
}

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  return isTokenValid() ? children : <Navigate to="/" replace />
}
