// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/" replace />
}