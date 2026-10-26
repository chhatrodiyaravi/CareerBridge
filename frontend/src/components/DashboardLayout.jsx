import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Search } from "lucide-react"
import Sidebar, { MobileSidebar } from "./Sidebar"
import { useAuth } from "../auth/AuthContext"
export default function DashboardLayout({ role, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState("")
  const [search, setSearch] = useState("")
  const displayName =
    role === "company"
      ? user?.companyProfile?.companyName || user?.name || "Account"
      : user?.name || "Account"
  const avatarUrl =
    role === "student"
      ? user?.studentProfile?.profileImage?.url
      : role === "company"
        ? user?.companyProfile?.logo?.url
        : undefined
  const avatarColors = {
    student: "#2563EB",
    company: "#7c3aed",
    admin: "#0891b2",
  }
  async function handleLogout() {
    setLogoutError("")
    try {
      await logout()
      navigate("/", { replace: true })
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to sign out.",
      )
    }
  }
  function handleSearch(event) {
    event.preventDefault()
    const query = search.trim()
    if (role !== "student" || !query) return
    navigate(`/student/internships?q=${encodeURIComponent(query)}`)
    setSearch("")
  }
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full">
        <Sidebar role={role} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 flex items-center gap-3 z-10">
          <div className="md:hidden">
            <MobileSidebar role={role} />
          </div>
          {role === "student" && (
            <form
              onSubmit={handleSearch}
              className="relative hidden max-w-xs flex-1 sm:block"
            >
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search internships"
                placeholder="Search internships..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </form>
          )}
          <div className="flex-1 md:flex-none" />
          {logoutError && (
            <span role="alert" className="text-xs text-red-600">
              {logoutError}
            </span>
          )}
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-8 w-8 rounded-xl bg-white object-cover"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white"
                style={{ background: avatarColors[role] }}
              >
                {displayName.charAt(0)}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              {displayName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            aria-label="Sign out"
            title="Sign out"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
