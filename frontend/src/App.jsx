import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState } from "react"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import PasswordReset from "./pages/PasswordReset"
import StudentDashboard from "./pages/student/Dashboard"
import StudentProfile from "./pages/student/Profile"
import MySkills from "./pages/student/Skills"
import MyProjects from "./pages/student/Projects"
import FindInternships from "./pages/student/Internships"
import InternshipDetails from "./pages/student/InternshipDetails"
import MyApplications from "./pages/student/Applications"
import Recommendations from "./pages/student/Recommendations"
import CompanyDashboard from "./pages/company/Dashboard"
import CompanyAnalytics from "./pages/company/Analytics"
import CompanyProfile from "./pages/company/CompanyProfile"
import MyInternships from "./pages/company/MyInternships"
import CreateInternship from "./pages/company/CreateInternship"
import Applicants from "./pages/company/Applicants"
import AdminDashboard from "./pages/admin/Dashboard"
import AdminManagement from "./pages/admin/Management"
import DashboardLayout from "./components/DashboardLayout"
import ProtectedRoute from "./auth/ProtectedRoute"
import { AuthProvider, useAuth } from "./auth/AuthContext"
function protectedPage(role, page) {
  return <ProtectedRoute role={role}>{page}</ProtectedRoute>
}
function SettingsPage({ role }) {
  const { user, updateSettings } = useAuth()
  const [settings, setSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    smsNotifications: user?.settings?.smsNotifications ?? false,
    profileVisibility: user?.settings?.profileVisibility ?? true,
    applicationReminders: user?.settings?.applicationReminders ?? true,
  })
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const settingFields = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      desc: "Receive email updates about applications and matches",
    },
    {
      key: "smsNotifications",
      label: "SMS Notifications",
      desc: "Get SMS alerts for important updates",
    },
    {
      key: "profileVisibility",
      label: "Profile Visibility",
      desc: "Allow companies to discover your profile",
    },
    {
      key: "applicationReminders",
      label: "Application Reminders",
      desc: "Get reminded about saved internships",
    },
  ]
  async function saveSettings() {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      await updateSettings(settings)
      setSaved(true)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save settings.",
      )
    } finally {
      setSaving(false)
    }
  }
  return (
    <DashboardLayout role={role}>
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-extrabold text-slate-900 mb-6"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Settings
        </h1>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          {settingFields.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {field.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{field.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[field.key]}
                  onChange={(event) => {
                    setSaved(false)
                    setSettings((current) => ({
                      ...current,
                      [field.key]: event.target.checked,
                    }))
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-blue-300" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          ))}
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-green-700">
              Settings saved.
            </p>
          )}
          <button
            type="button"
            onClick={() => void saveSettings()}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<PasswordReset />} />
          <Route path="/reset-password" element={<PasswordReset />} />

          {/* Student */}
          <Route
            path="/student"
            element={protectedPage("student", <StudentDashboard />)}
          />
          <Route
            path="/student/profile"
            element={protectedPage("student", <StudentProfile />)}
          />
          <Route
            path="/student/skills"
            element={protectedPage("student", <MySkills />)}
          />
          <Route
            path="/student/projects"
            element={protectedPage("student", <MyProjects />)}
          />
          <Route
            path="/student/internships"
            element={protectedPage("student", <FindInternships />)}
          />
          <Route
            path="/student/internships/:id"
            element={protectedPage("student", <InternshipDetails />)}
          />
          <Route
            path="/student/applications"
            element={protectedPage("student", <MyApplications />)}
          />
          <Route
            path="/student/recommendations"
            element={protectedPage("student", <Recommendations />)}
          />
          <Route
            path="/student/settings"
            element={protectedPage("student", <SettingsPage role="student" />)}
          />

          {/* Company */}
          <Route
            path="/company"
            element={protectedPage("company", <CompanyDashboard />)}
          />
          <Route
            path="/company/profile"
            element={protectedPage("company", <CompanyProfile />)}
          />
          <Route
            path="/company/internships"
            element={protectedPage("company", <MyInternships />)}
          />
          <Route
            path="/company/create"
            element={protectedPage("company", <CreateInternship />)}
          />
          <Route
            path="/company/applicants"
            element={protectedPage("company", <Applicants />)}
          />
          <Route
            path="/company/analytics"
            element={protectedPage("company", <CompanyAnalytics />)}
          />
          <Route
            path="/company/settings"
            element={protectedPage("company", <SettingsPage role="company" />)}
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={protectedPage("admin", <AdminDashboard />)}
          />
          <Route
            path="/admin/students"
            element={protectedPage("admin", <AdminManagement tab="students" />)}
          />
          <Route
            path="/admin/companies"
            element={protectedPage(
              "admin",
              <AdminManagement tab="companies" />,
            )}
          />
          <Route
            path="/admin/internships"
            element={protectedPage(
              "admin",
              <AdminManagement tab="internships" />,
            )}
          />
          <Route
            path="/admin/applications"
            element={protectedPage(
              "admin",
              <AdminManagement tab="applications" />,
            )}
          />
          <Route
            path="/admin/analytics"
            element={protectedPage("admin", <AdminDashboard />)}
          />
          <Route
            path="/admin/settings"
            element={protectedPage("admin", <SettingsPage role="admin" />)}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
