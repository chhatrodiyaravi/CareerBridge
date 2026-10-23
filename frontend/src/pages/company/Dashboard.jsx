import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Briefcase,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Users,
} from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { useAuth } from "../../auth/AuthContext"
import { apiRequest } from "../../lib/api"
export default function CompanyDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [internships, setInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    Promise.all([
      apiRequest("/internships/company/mine"),
      apiRequest("/company/applications"),
    ])
      .then(([internshipResult, applicationResult]) => {
        setInternships(internshipResult.internships)
        setApplications(applicationResult.applications)
      })
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load company overview.",
        ),
      )
      .finally(() => setLoading(false))
  }, [])
  const stats = [
    {
      label: "Active Internships",
      value: internships.filter((item) => item.status === "published").length,
      icon: Briefcase,
      color: "#2563EB",
      bg: "#eff6ff",
    },
    {
      label: "Total Applicants",
      value: applications.length,
      icon: Users,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Shortlisted",
      value: applications.filter((item) => item.status === "shortlisted")
        .length,
      icon: TrendingUp,
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      label: "Selected",
      value: applications.filter((item) => item.status === "selected").length,
      icon: CheckCircle,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
  ]
  const activeInternships = internships
    .filter((item) => item.status === "published")
    .slice(0, 3)
  return (
    <DashboardLayout role="company">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Company Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {user?.companyProfile?.companyName || user?.name}
          {user?.companyProfile?.location
            ? ` • ${user.companyProfile.location}`
            : ""}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: stat.bg }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div
              className="mb-0.5 text-3xl font-extrabold text-slate-900"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              {loading ? "—" : stat.value}
            </div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="font-semibold text-slate-800"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              Active Internships
            </h2>
            <button
              onClick={() => navigate("/company/internships")}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
            >
              View All <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-2.5">
            {activeInternships.map((internship) => (
              <div
                key={internship.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  {internship.title.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {internship.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {internship.openings} openings • {internship.mode}
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>
            ))}
            {!loading && !activeInternships.length && (
              <p className="py-6 text-center text-sm text-slate-500">
                You have no active internship listings.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
          <h2
            className="mb-4 font-semibold"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Post Internship", path: "/company/create" },
              { label: "View Applicants", path: "/company/applicants" },
              { label: "Company Profile", path: "/company/profile" },
              { label: "Manage Internships", path: "/company/internships" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="rounded-xl border border-white/20 bg-white/10 p-3 text-left text-xs font-medium transition-colors hover:bg-white/20"
              >
                {action.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="font-semibold text-slate-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Recent Applicants
          </h2>
          <button
            onClick={() => navigate("/company/applicants")}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            View All <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-3">
          {applications.slice(0, 4).map((application) => {
            const student = application.student
            return (
              <div
                key={application.id}
                className="flex items-center gap-4 rounded-xl border border-slate-100 p-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {student.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {application.internship.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {student.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 text-xs capitalize text-slate-500">
                  {application.status}
                </span>
              </div>
            )
          })}
          {!loading && !applications.length && (
            <p className="py-6 text-center text-sm text-slate-500">
              No applications yet.
            </p>
          )}
        </div>
      </section>
    </DashboardLayout>
  )
}
