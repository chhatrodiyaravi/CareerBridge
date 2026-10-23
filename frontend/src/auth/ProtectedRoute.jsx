import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext"
export default function ProtectedRoute({ children, role }) {
  const { user, status, error, refreshSession } = useAuth()
  const location = useLocation()
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Restoring your session…
      </div>
    )
  }
  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => void refreshSession()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />
  }
  return children
}
