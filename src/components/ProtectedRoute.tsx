// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

export function isTokenValid(): boolean {
  const token = localStorage.getItem("token")
  if (!token) return false

  try {
    const decoded: any = jwtDecode(token)
    const exp = decoded?.exp
    const now = Date.now() / 1000
    return typeof exp === "number" && exp > now
  } catch (e) {
    console.warn("Feil ved dekoding av token:", e)
    return false
  }
}

export default function ProtectedRoute({ children }: { children: JSX.Element })
{

 return isTokenValid() ? children : <Navigate to="/" replace />
}
