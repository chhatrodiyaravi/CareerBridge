import { useEffect, useMemo, useState } from "react"
import { Search, ShieldCheck, Ban } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { apiRequest } from "../../lib/api"
const tabs = [
  { key: "students", label: "Students" },
  { key: "companies", label: "Companies" },
  { key: "internships", label: "Internships" },
  { key: "applications", label: "Applications" },
]
const headers = {
  students: ["Student", "Email", "Degree", "College", "Skills", "Status"],
  companies: [
    "Company",
    "Industry",
    "Location",
    "Internships",
    "Applicants",
    "Verification",
  ],
  internships: [
    "Internship",
    "Company",
    "Location",
    "Mode",
    "Duration",
    "Openings",
    "Status",
  ],
  applications: ["Company", "Internship", "Student", "Date", "Match", "Status"],
}
export default function AdminManagement({ tab: initialTab = "students" }) {
  const [tab, setTab] = useState(initialTab)
  const [recordsByTab, setRecordsByTab] = useState({
    students: [],
    companies: [],
    internships: [],
    applications: [],
  })
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    Promise.all(tabs.map(({ key }) => apiRequest(`/admin/management/${key}`)))
      .then((results) => {
        setRecordsByTab({
          students: results[0].records,
          companies: results[1].records,
          internships: results[2].records,
          applications: results[3].records,
        })
      })
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load platform records.",
        ),
      )
      .finally(() => setLoading(false))
  }, [])
  const records = recordsByTab[tab]
  const filtered = useMemo(
    () =>
      records.filter((record) =>
        Object.values(record).some((value) => {
          if (Array.isArray(value))
            return value.some((item) =>
              String(item).toLowerCase().includes(query.toLowerCase()),
            )
          return String(value ?? "")
            .toLowerCase()
            .includes(query.toLowerCase())
        }),
      ),
    [records, query],
  )
  async function updateRecord(record, action, statusValue) {
    setError("")
    let path = ""
    let body = {}
    let key = "status"
    let nextStatus = statusValue ?? ""
    if (tab === "students") {
      nextStatus = record.status === "active" ? "inactive" : "active"
      path = `/admin/users/${encodeURIComponent(record.id)}/status`
      body = { status: nextStatus }
    } else if (tab === "companies") {
      key = "verificationStatus"
      nextStatus = action === "reject" ? "rejected" : "verified"
      path = `/admin/companies/${encodeURIComponent(record.id)}/verification`
      body = { verificationStatus: nextStatus }
    } else if (tab === "internships") {
      nextStatus = record.status === "closed" ? "published" : "closed"
      path = `/admin/internships/${encodeURIComponent(record.id)}/status`
      body = { status: nextStatus }
    } else {
      path = `/admin/applications/${encodeURIComponent(record.id)}/status`
      body = { status: nextStatus }
    }
    try {
      await apiRequest(path, { method: "PATCH", body: JSON.stringify(body) })
      setRecordsByTab((current) => ({
        ...current,
        [tab]: current[tab].map((item) =>
          item.id === record.id ? { ...item, [key]: nextStatus } : item,
        ),
      }))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update this record.",
      )
    }
  }
  function getCells(record) {
    if (tab === "students")
      return [
        record.name,
        record.email,
        record.degree || "—",
        record.college || "—",
        (record.skills ?? []).join(", ") || "—",
        record.status,
      ]
    if (tab === "companies")
      return [
        record.name,
        record.industry || "—",
        record.location || "—",
        record.internshipCount,
        record.applicantCount,
        record.verificationStatus,
      ]
    if (tab === "internships")
      return [
        record.title,
        record.company,
        record.location || "—",
        record.mode,
        record.duration || "—",
        record.openings,
        record.status,
      ]
    return [
      record.company,
      record.internship,
      record.student,
      record.date ? new Date(record.date).toLocaleDateString() : "—",
      `${record.match ?? 0}%`,
      record.status,
    ]
  }
  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Platform Management
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage accounts, companies, internships, and applications.
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

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === item.key
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                tab === item.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {recordsByTab[item.key].length}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${tab}...`}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {headers[tab].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50">
                  {getCells(record).map((cell, index) => (
                    <td
                      key={index}
                      className="px-4 py-3.5 text-xs text-slate-600"
                    >
                      {cell}
                    </td>
                  ))}
                  <td className="px-4 py-3.5">
                    {tab === "students" && (
                      <button
                        onClick={() => void updateRecord(record, "toggle")}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        <Ban size={13} />
                        {record.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    )}
                    {tab === "companies" && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => void updateRecord(record, "verify")}
                          className="flex items-center gap-1 rounded-lg border border-green-200 px-2 py-2 text-xs text-green-700 hover:bg-green-50"
                        >
                          <ShieldCheck size={13} />
                          Verify
                        </button>
                        <button
                          onClick={() => void updateRecord(record, "reject")}
                          className="rounded-lg border border-red-200 px-2 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {tab === "internships" && (
                      <button
                        onClick={() => void updateRecord(record, "toggle")}
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        {record.status === "closed" ? "Reopen" : "Close"}
                      </button>
                    )}
                    {tab === "applications" && (
                      <select
                        value={record.status}
                        onChange={(event) =>
                          void updateRecord(
                            record,
                            "status",
                            event.target.value,
                          )
                        }
                        aria-label={`Update application status for ${record.student}`}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700"
                      >
                        {[
                          "applied",
                          "reviewed",
                          "shortlisted",
                          "rejected",
                          "selected",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && !filtered.length && (
                <tr>
                  <td
                    colSpan={headers[tab].length + 1}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No {tab} found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td
                    colSpan={headers[tab].length + 1}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Loading records…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
