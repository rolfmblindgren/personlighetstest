// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { loggedIn } = useAuth()

  if (!loggedIn) {
    return <Navigate to="/" replace />
  }

  return children
}
