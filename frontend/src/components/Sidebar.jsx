import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  User,
  Zap,
  FolderOpen,
  Search,
  FileText,
  Lightbulb,
  Settings,
  LogOut,
  Building2,
  Users,
  BarChart3,
  PlusCircle,
  X,
  Menu,
  Shield,
} from "lucide-react"
import Logo from "./Logo"
import { useAuth } from "../auth/AuthContext"
const studentNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student" },
  { icon: User, label: "My Profile", path: "/student/profile" },
  { icon: Zap, label: "My Skills", path: "/student/skills" },
  { icon: FolderOpen, label: "My Projects", path: "/student/projects" },
  { icon: Search, label: "Find Internships", path: "/student/internships" },
  { icon: FileText, label: "Applications", path: "/student/applications" },
  {
    icon: Lightbulb,
    label: "Recommendations",
    path: "/student/recommendations",
  },
  { icon: Settings, label: "Settings", path: "/student/settings" },
]
const companyNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/company" },
  { icon: Building2, label: "Company Profile", path: "/company/profile" },
  { icon: FileText, label: "My Internships", path: "/company/internships" },
  { icon: PlusCircle, label: "Create Internship", path: "/company/create" },
  { icon: Users, label: "Applicants", path: "/company/applicants" },
  { icon: BarChart3, label: "Analytics", path: "/company/analytics" },
  { icon: Settings, label: "Settings", path: "/company/settings" },
]
const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Students", path: "/admin/students" },
  { icon: Building2, label: "Companies", path: "/admin/companies" },
  { icon: FileText, label: "Internships", path: "/admin/internships" },
  { icon: FileText, label: "Applications", path: "/admin/applications" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
]
function NavItem({ icon: Icon, label, path, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={17} />
      <span>{label}</span>
    </button>
  )
}
export default function Sidebar({ role, mobile, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [logoutError, setLogoutError] = useState("")
  const navItems =
    role === "student" ? studentNav : role === "company" ? companyNav : adminNav
  const handleNav = (path) => {
    navigate(path)
    onClose?.()
  }
  const handleLogout = async () => {
    setLogoutError("")
    try {
      await logout()
      navigate("/", { replace: true })
      onClose?.()
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to sign out.",
      )
    }
  }
  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-slate-100 ${
        mobile ? "w-full" : "w-60"
      }`}
    >
      <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
        <Logo size="sm" />
        {mobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={20} className="text-slate-500" />
          </button>
        )}
      </div>
      {role === "admin" && (
        <div className="mx-3 mt-3 px-3 py-2 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">
              Admin Panel
            </span>
          </div>
        </div>
      )}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={location.pathname === item.path}
            onClick={() => handleNav(item.path)}
          />
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-100">
        {logoutError && (
          <p role="alert" className="mb-2 px-3 text-xs text-red-600">
            {logoutError}
          </p>
        )}
        <button
          onClick={() => void handleLogout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
export function MobileSidebar({ role }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-slate-100"
      >
        <Menu size={20} className="text-slate-600" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 h-full shadow-2xl">
            <Sidebar role={role} mobile onClose={() => setOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  )
}
