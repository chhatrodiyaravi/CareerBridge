import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from "lucide-react"
import Logo from "../components/Logo"
import { useAuth } from "../auth/AuthContext"
export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [show, setShow] = useState(false)
  const [role, setRole] = useState("student")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!acceptedTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.")
      return
    }
    setSubmitting(true)
    try {
      const user = await register({ name, email, password, role })
      navigate(`/${user.role}`, { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create your account.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <Logo dark size="lg" />
          <h2
            className="text-3xl font-extrabold mt-8 mb-3 leading-tight"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Start Your Career
            <br />
            Journey Today
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8">
            Create a free account and start matching your skills with the best
            internship opportunities.
          </p>
          <div className="space-y-3">
            {[
              "✓ Free forever, no hidden fees",
              "✓ Smart skill matching",
              "✓ Personalized recommendations",
              "✓ Track all your applications",
            ].map((t) => (
              <p key={t} className="text-sm text-blue-100">
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <h1
            className="text-2xl font-extrabold text-slate-900 mb-1"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Join CareerBridge
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Create your account and start exploring
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-slate-100 rounded-xl">
              {["student", "company"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                    role === r
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {r === "student" ? "👨‍🎓 Student" : "🏢 Company"}
                </button>
              ))}
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Your full name"
                    maxLength={120}
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
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
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
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
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                    placeholder="Min 8 characters"
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
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5 rounded border-slate-300"
              />
              <span className="text-xs text-slate-500">
                I agree to the{" "}
                <span className="text-blue-600">Terms of Service</span> and{" "}
                <span className="text-blue-600">Privacy Policy</span>
              </span>
            </label>

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
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
              {submitting ? "Creating account…" : "Create Account"}{" "}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
