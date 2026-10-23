import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, CheckCircle, XCircle, Eye } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { apiRequest } from "../../lib/api"
const labels = {
  applied: "Applied",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  selected: "Selected",
}
const statusClasses = {
  applied: "bg-slate-100 text-slate-600 border-slate-200",
  reviewed: "bg-purple-50 text-purple-700 border-purple-200",
  shortlisted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  selected: "bg-blue-50 text-blue-700 border-blue-200",
}
export default function Applicants() {
  const [searchParams] = useSearchParams()
  const internshipFilter = searchParams.get("internship")
  const [applications, setApplications] = useState([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    const queryString = internshipFilter
      ? `?internship=${encodeURIComponent(internshipFilter)}`
      : ""
    apiRequest(`/company/applications${queryString}`)
      .then((result) => setApplications(result.applications))
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load applicants.",
        ),
      )
      .finally(() => setLoading(false))
  }, [internshipFilter])
  const filtered = useMemo(
    () =>
      applications.filter((application) => {
        const search = query.toLowerCase()
        const matchesSearch =
          !search ||
          application.student.name.toLowerCase().includes(search) ||
          application.student.skills.some((skill) =>
            skill.toLowerCase().includes(search),
          ) ||
          application.internship.title.toLowerCase().includes(search)
        return (
          matchesSearch && (filter === "all" || application.status === filter)
        )
      }),
    [applications, filter, query],
  )
  async function updateStatus(applicationId, status) {
    setError("")
    try {
      await apiRequest(
        `/company/applications/${encodeURIComponent(applicationId)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      )
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status }
            : application,
        ),
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update this application.",
      )
    }
  }
  const filters = [
    "all",
    "applied",
    "reviewed",
    "shortlisted",
    "rejected",
    "selected",
  ]
  return (
    <DashboardLayout role="company">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Applicants
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {filtered.length} applicants found
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

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, internship, or skill..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-xl px-3.5 py-2 text-xs font-medium capitalize transition-colors ${
                filter === value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {value === "all" ? "All" : labels[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading && (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading applicants…
          </p>
        )}
        {!loading &&
          filtered.map((application) => {
            const matchCount = application.internship.requiredSkills.filter(
              (skill) =>
                application.student.skills.some(
                  (candidate) =>
                    candidate.toLowerCase() === skill.toLowerCase(),
                ),
            ).length
            const match = application.internship.requiredSkills.length
              ? Math.round(
                  (matchCount / application.internship.requiredSkills.length) *
                    100,
                )
              : 0
            const education = [
              application.student.education.degree,
              application.student.education.college,
            ]
              .filter(Boolean)
              .join(" • ")
            return (
              <article
                key={application.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white">
                  {application.student.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">
                    {application.student.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {education || application.student.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {application.internship.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {application.student.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {application.coverLetter && (
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                      {application.coverLetter}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-center">
                  <div
                    className="text-2xl font-extrabold text-blue-600"
                    style={{ fontFamily: "'Outfit',sans-serif" }}
                  >
                    {match}%
                  </div>
                  <div className="text-xs text-slate-400">Skill match</div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[application.status]}`}
                >
                  {labels[application.status]}
                </span>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={`mailto:${encodeURIComponent(application.student.email)}`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye size={12} /> Contact
                  </a>
                  {application.status !== "shortlisted" &&
                    application.status !== "rejected" && (
                      <>
                        <button
                          onClick={() =>
                            void updateStatus(application.id, "shortlisted")
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle size={12} /> Shortlist
                        </button>
                        <button
                          onClick={() =>
                            void updateStatus(application.id, "rejected")
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                  {application.resumeUrl && (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="self-center text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Resume
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        {!loading && !error && filtered.length === 0 && (
          <p className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500">
            No applications match these filters.
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
