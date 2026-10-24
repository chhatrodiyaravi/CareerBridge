import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Briefcase,
  ChartNoAxesCombined,
} from "lucide-react"
import Logo from "../components/Logo"
import { useAuth } from "../auth/AuthContext"
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, logout } = useAuth()
  const isAdminLogin = location.pathname === "/admin/login"
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const user = await login(email, pass)
      if (isAdminLogin && user.role !== "admin") {
        await logout()
        setError("This account does not have administrator access.")
        return
      }
      const from = isAdminLogin ? "/admin" : location.state?.from
      navigate(from || `/${user.role}`, { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen flex">
      {/* Left illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <Logo dark size="lg" />
          <h2
            className="text-3xl font-extrabold mt-8 mb-3 leading-tight"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Bridge Your Skills
            <br />
            to Your Career
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8">
            Sign in to manage your profile, explore current listings, and track
            your applications.
          </p>
          {[
            {
              icon: Briefcase,
              title: "Explore opportunities",
              description:
                "Search published internships and view role requirements.",
            },
            {
              icon: ChartNoAxesCombined,
              title: "Track your progress",
              description:
                "Review skill matches and application status in your dashboard.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="mb-3 flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-blue-200">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <h1
            className="text-2xl font-extrabold text-slate-900 mb-1"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            {isAdminLogin ? "Administrator sign in" : "Welcome back"}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {isAdminLogin
              ? "Sign in with your administrator account"
              : "Sign in to continue your career journey"}
          </p>
          {location.state?.message && (
            <p
              role="status"
              className="mb-4 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700"
            >
              {location.state.message}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={show ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {!isAdminLogin && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/forgot-password", { state: { email } })
                    }
                    className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm shadow-blue-200 mb-6"
            >
              {submitting ? "Signing in…" : "Sign In"} <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            {isAdminLogin
              ? "Not an administrator? "
              : "Don't have an account? "}
            <button
              onClick={() =>
                navigate(isAdminLogin ? "/login" : "/register", {
                  replace: true,
                })
              }
              className="text-blue-600 font-semibold hover:underline"
            >
              {isAdminLogin ? "Standard sign in" : "Create Account"}
            </button>
          </p>
          {!isAdminLogin && (
            <p className="text-center text-xs text-slate-400 mt-2">
              <button
                onClick={() => navigate("/admin/login")}
                className="hover:text-slate-600"
              >
                Admin access →
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
