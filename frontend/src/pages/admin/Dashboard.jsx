import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Building2,
  ChevronRight,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import DashboardLayout from "../../components/DashboardLayout"
import { apiRequest } from "../../lib/api"
export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    apiRequest("/admin/stats")
      .then(setOverview)
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load platform analytics.",
        ),
      )
      .finally(() => setLoading(false))
  }, [])
  const stats = [
    {
      label: "Total Students",
      value: overview?.stats.totalStudents ?? 0,
      icon: Users,
      color: "#2563EB",
      bg: "#eff6ff",
    },
    {
      label: "Total Companies",
      value: overview?.stats.totalCompanies ?? 0,
      icon: Building2,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Active Internships",
      value: overview?.stats.activeInternships ?? 0,
      icon: FileText,
      color: "#059669",
      bg: "#f0fdf4",
    },
    {
      label: "Total Applications",
      value: overview?.stats.totalApplications ?? 0,
      icon: TrendingUp,
      color: "#d97706",
      bg: "#fffbeb",
    },
  ]
  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Admin Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Live platform overview and analytics
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
              className="mb-0.5 text-2xl font-extrabold text-slate-900"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              {loading ? "—" : stat.value.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2
            className="mb-4 font-semibold text-slate-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Monthly Registrations & Applications
          </h2>
          {overview?.monthly.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={overview.monthly}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#2563EB"
                  fill="#dbeafe"
                  strokeWidth={2}
                  name="Students"
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#7c3aed"
                  fill="#ede9fe"
                  strokeWidth={2}
                  name="Applications"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">
              {loading ? "Loading…" : "No activity has been recorded yet."}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2
            className="mb-4 font-semibold text-slate-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Most Popular Skills
          </h2>
          {overview?.topSkills.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.topSkills} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="skill"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#2563EB"
                  radius={[0, 6, 6, 0]}
                  name="Students"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">
              {loading ? "Loading…" : "No student skills have been added yet."}
            </p>
          )}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[
          {
            title: "Recent Students",
            path: "/admin/students",
            records: overview?.recentStudents ?? [],
            description: (record) =>
              [record.degree, record.college].filter(Boolean).join(" • "),
          },
          {
            title: "Recent Companies",
            path: "/admin/companies",
            records: overview?.recentCompanies ?? [],
            description: (record) =>
              [record.industry, record.location].filter(Boolean).join(" • "),
          },
        ].map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{section.title}</h2>
              <Link
                to={section.path}
                className="flex items-center gap-1 text-xs font-medium text-blue-600"
              >
                View All <ChevronRight size={13} />
              </Link>
            </div>
            {section.records.length ? (
              <div className="space-y-2.5">
                {section.records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                      {record.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {record.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {section.description(record)}
                      </p>
                    </div>
                    <span className="text-xs capitalize text-slate-500">
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                {loading ? "Loading…" : "No records yet."}
              </p>
            )}
          </section>
        ))}
      </div>
    </DashboardLayout>
  )
}
