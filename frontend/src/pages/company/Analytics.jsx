import { useEffect, useState } from "react"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import DashboardLayout from "../../components/DashboardLayout"

import { apiRequest } from "../../lib/api"

const statuses = ["applied", "reviewed", "shortlisted", "rejected", "selected"]

export default function CompanyAnalytics() {
  const [analytics, setAnalytics] = useState(null)

  const [error, setError] = useState("")

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest("/internships/company/analytics")

      .then(setAnalytics)

      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load company analytics.",
        ),
      )

      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout role="company">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Company Analytics
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Application activity across your internship listings.
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Internships", value: analytics?.summary.internships },

          {
            label: "Active Internships",
            value: analytics?.summary.activeInternships,
          },

          {
            label: "Total Applicants",
            value: analytics?.summary.totalApplicants,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {loading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">
            Applications over the last six months
          </h2>
          {analytics?.monthly.some((item) => item.applications > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="applications"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">
              {loading
                ? "Loading analytics…"
                : "No applications have been received in this period."}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">
            Application statuses
          </h2>
          <div className="space-y-3">
            {statuses.map((status) => {
              const count = analytics?.applicationsByStatus[status] ?? 0

              const total = analytics?.summary.totalApplicants ?? 0

              const percentage = total ? (count / total) * 100 : 0

              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-slate-600">{status}</span>
                    <span className="font-semibold text-slate-800">
                      {loading ? "—" : count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">
          Applications by internship
        </h2>
        {analytics?.internships.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 pr-4">Internship</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.internships.map((internship) => (
                  <tr key={internship.id}>
                    <td className="py-3 pr-4 font-medium text-slate-800">
                      {internship.title}
                    </td>
                    <td className="py-3 pr-4 capitalize text-slate-600">
                      {internship.status}
                    </td>
                    <td className="py-3 text-slate-600">
                      {internship.applicants}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            {loading
              ? "Loading analytics…"
              : "Create an internship to see listing analytics."}
          </p>
        )}
      </section>
    </DashboardLayout>
  )
}
