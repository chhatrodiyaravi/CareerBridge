import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Briefcase, ChevronRight, FileText, UserRound, Zap } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { useAuth } from "../../auth/AuthContext"
import { apiRequest } from "../../lib/api"
const statusColors = {
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  reviewed: "bg-purple-50 text-purple-700 border-purple-200",
  shortlisted: "bg-orange-50 text-orange-700 border-orange-200",
  selected: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
}
function MatchBar({ match }) {
  const color =
    match >= 90
      ? "#16a34a"
      : match >= 70
        ? "#2563EB"
        : match >= 50
          ? "#d97706"
          : "#dc2626"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${match}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>
        {match}%
      </span>
    </div>
  )
}
export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [internships, setInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const skills = user?.studentProfile?.skills ?? []
  useEffect(() => {
    Promise.all([apiRequest("/internships"), apiRequest("/applications/mine")])
      .then(([internshipResult, applicationResult]) => {
        setInternships(internshipResult.internships)
        setApplications(applicationResult.applications)
      })
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load your dashboard.",
        ),
      )
      .finally(() => setLoading(false))
  }, [])
  const education = user?.studentProfile?.education
  const completed = [
    user?.name,
    user?.email,
    user?.studentProfile?.phone,
    user?.studentProfile?.location,
    education?.degree,
    education?.college,
    skills.length > 0,
  ].filter(Boolean).length
  const profileCompletion = Math.round((completed / 7) * 100)
  const topInternships = [...internships]
    .sort((a, b) => b.match - a.match)
    .slice(0, 3)
  const statCards = [
    {
      label: "Profile Completion",
      value: `${profileCompletion}%`,
      icon: UserRound,
      color: "#2563EB",
      bg: "#eff6ff",
    },
    {
      label: "My Skills",
      value: skills.length,
      icon: Zap,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Available Internships",
      value: internships.length,
      icon: Briefcase,
      color: "#059669",
      bg: "#f0fdf4",
    },
    {
      label: "Applications",
      value: applications.length,
      icon: FileText,
      color: "#d97706",
      bg: "#fffbeb",
    },
  ]
  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Welcome, {user?.name} 👋
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Explore opportunities that match your saved skills.
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
        {statCards.map((stat) => (
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
              className="mb-0.5 text-2xl font-extrabold text-slate-900"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              {loading ? "—" : stat.value}
            </div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="font-semibold text-slate-800"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              My Skills
            </h2>
            <button
              onClick={() => navigate("/student/skills")}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
            >
              Manage <ChevronRight size={13} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
            {!skills.length && (
              <p className="text-sm text-slate-500">
                Add skills to improve your matches.
              </p>
            )}
          </div>
          <button
            onClick={() => navigate("/student/skills")}
            className="mt-4 w-full rounded-xl bg-blue-50 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
          >
            Manage Skills
          </button>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white lg:col-span-2">
          <h2
            className="mb-1 font-semibold"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Profile Completion
          </h2>
          <p className="mb-4 text-xs text-blue-200">
            Keep your profile updated so companies can learn about you.
          </p>
          <div className="mb-4 flex items-center gap-3">
            <div className="text-4xl font-extrabold">{profileCompletion}%</div>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => navigate("/student/profile")}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            Update Profile
          </button>
        </section>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="font-semibold text-slate-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Recommended Internships
          </h2>
          <button
            onClick={() => navigate("/student/internships")}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            View All <ChevronRight size={13} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topInternships.map((internship) => (
            <article
              key={internship.id}
              className="rounded-2xl border border-slate-100 p-4 transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                  {internship.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-800">
                    {internship.title}
                  </h3>
                  <p className="text-xs text-slate-500">{internship.company}</p>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {internship.location && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {internship.location}
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {internship.mode}
                </span>
              </div>
              <MatchBar match={internship.match} />
              <button
                onClick={() =>
                  navigate(
                    `/student/internships/${encodeURIComponent(internship.id)}`,
                  )
                }
                className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                View Details
              </button>
            </article>
          ))}
          {!loading && !topInternships.length && (
            <p className="col-span-full py-6 text-center text-sm text-slate-500">
              No published internships are available yet.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="font-semibold text-slate-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Recent Applications
          </h2>
          <button
            onClick={() => navigate("/student/applications")}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            View All <ChevronRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                {[
                  "Company",
                  "Internship",
                  "Applied Date",
                  "Match",
                  "Status",
                ].map((header) => (
                  <th
                    key={header}
                    className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.slice(0, 5).map((application) => (
                <tr key={application.id}>
                  <td className="py-3 pr-4 text-xs font-medium text-slate-800">
                    {application.company}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600">
                    {application.internship}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-400">
                    {new Date(application.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold text-blue-600">
                    {application.match}%
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[application.status]}`}
                    >
                      {application.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && !applications.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  )
}
