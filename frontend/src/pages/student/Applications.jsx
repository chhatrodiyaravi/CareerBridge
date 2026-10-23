import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { apiRequest } from "../../lib/api"
const statusConfig = {
  Applied: {
    cls: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  Reviewed: {
    cls: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  Shortlisted: {
    cls: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  Selected: {
    cls: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  Rejected: { cls: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" },
}
export default function MyApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    apiRequest("/applications/mine")
      .then((result) => setApplications(result.applications))
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load applications.",
        ),
      )
      .finally(() => setLoading(false))
  }, [])
  const stats = [
    {
      label: "Total Applied",
      value: applications.length,
      color: "#2563EB",
      bg: "#eff6ff",
    },
    {
      label: "Reviewed",
      value: applications.filter((a) => a.status === "Reviewed").length,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Shortlisted",
      value: applications.filter((a) => a.status === "Shortlisted").length,
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      label: "Selected",
      value: applications.filter((a) => a.status === "Selected").length,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
  ]
  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          My Applications
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Track all your internship applications
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
      {loading && (
        <p className="mb-4 text-sm text-slate-500">Loading applications…</p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4"
          >
            <div
              className="text-3xl font-extrabold mb-0.5"
              style={{ color: s.color, fontFamily: "'Outfit',sans-serif" }}
            >
              {s.value}
            </div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2
            className="font-semibold text-slate-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            All Applications
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Company
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Internship
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Applied Date
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Match
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!loading && applications.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    You haven’t applied to any internships yet.
                  </td>
                </tr>
              )}
              {applications.map((app) => {
                const label =
                  app.status.charAt(0).toUpperCase() + app.status.slice(1)
                const cfg = statusConfig[label]
                return (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                          {app.company.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {app.company}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {app.internship}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {new Date(app.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${app.match}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-blue-600">
                          {app.match}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`flex items-center gap-1.5 w-fit text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          app.internshipId &&
                          navigate(
                            `/student/internships/${encodeURIComponent(app.internshipId)}`,
                          )
                        }
                        disabled={!app.internshipId}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline disabled:text-slate-400"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
