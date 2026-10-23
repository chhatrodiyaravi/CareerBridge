import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ApiError, apiRequest } from "../lib/api"
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState(null)
  const refreshSession = useCallback(async () => {
    setStatus("loading")
    setError(null)
    try {
      const response = await apiRequest("/auth/me")
      setUser(response.user)
      setStatus("authenticated")
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        setUser(null)
        setStatus("unauthenticated")
        return
      }
      setStatus("error")
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to restore your session.",
      )
    }
  }, [])
  useEffect(() => {
    void refreshSession()
  }, [refreshSession])
  const login = useCallback(async (email, password) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    setUser(response.user)
    setStatus("authenticated")
    setError(null)
    return response.user
  }, [])
  const register = useCallback(async (input) => {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
    setUser(response.user)
    setStatus("authenticated")
    setError(null)
    return response.user
  }, [])
  const logout = useCallback(async () => {
    await apiRequest("/auth/logout", { method: "POST" })
    setUser(null)
    setStatus("unauthenticated")
    setError(null)
  }, [])
  const updateProfile = useCallback(async (input) => {
    const response = await apiRequest("/profile", {
      method: "PUT",
      body: JSON.stringify(input),
    })
    setUser(response.user)
    return response.user
  }, [])
  const updateSettings = useCallback(async (settings) => {
    await apiRequest("/settings", {
      method: "PUT",
      body: JSON.stringify({ settings }),
    })
    setUser((current) => (current ? { ...current, settings } : current))
  }, [])
  const value = useMemo(
    () => ({
      user,
      status,
      error,
      login,
      register,
      logout,
      updateProfile,
      updateSettings,
      refreshSession,
    }),
    [
      user,
      status,
      error,
      login,
      register,
      logout,
      updateProfile,
      updateSettings,
      refreshSession,
    ],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider.")
  }
  return value
}
