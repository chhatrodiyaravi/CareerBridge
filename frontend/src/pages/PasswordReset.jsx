import { useState } from "react"

import { Link, useLocation, useNavigate } from "react-router-dom"

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react"

import Logo from "../components/Logo"

import { apiRequest } from "../lib/api"

export default function PasswordReset() {
  const location = useLocation()

  const navigate = useNavigate()

  const [email, setEmail] = useState(location.state?.email || "")

  const [otp, setOtp] = useState("")

  const [password, setPassword] = useState("")

  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [otpSent, setOtpSent] = useState(false)

  const [error, setError] = useState("")

  const [message, setMessage] = useState("")

  const [submitting, setSubmitting] = useState(false)

  async function requestOtp() {
    setError("")

    setMessage("")

    setSubmitting(true)

    try {
      const response = await apiRequest("/auth/forgot-password", {
        method: "POST",

        body: JSON.stringify({ email }),
      })

      setOtpSent(true)

      setOtp("")

      setPassword("")

      setConfirmPassword("")

      setMessage(response.message)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send the verification code.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError("")

    setMessage("")

    if (!otpSent) {
      await requestOtp()

      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")

      return
    }

    setSubmitting(true)

    try {
      const response = await apiRequest("/auth/reset-password", {
        method: "POST",

        body: JSON.stringify({ email, otp, password }),
      })

      navigate("/login", {
        replace: true,

        state: { message: response.message },
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset your password.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <Logo />
        </div>
        <h1
          className="mb-2 text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          {otpSent ? "Verify your email" : "Forgot your password?"}
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          {otpSent
            ? "Enter the six-digit code we emailed you and choose a new password."
            : "Enter your account email and we'll send you a verification code."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
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
                  readOnly={otpSent}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 read-only:bg-slate-50"
                />
              </div>
            </div>
            {otpSent && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Email verification code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="6-digit code"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm tracking-[0.3em] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-10 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmed password"
                          : "Show confirmed password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          {message && (
            <p
              role="status"
              className="mb-4 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700"
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Please wait…"
              : otpSent
                ? "Verify Code & Reset Password"
                : "Send Verification Code"}
            <ArrowRight size={16} />
          </button>
        </form>

        {otpSent && (
          <div className="mb-5 flex justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => void requestOtp()}
              disabled={submitting}
              className="font-semibold text-blue-600 hover:underline disabled:opacity-60"
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpSent(false)

                setOtp("")

                setError("")

                setMessage("")
              }}
              className="text-slate-500 hover:text-slate-700"
            >
              Change email
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-500">
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
