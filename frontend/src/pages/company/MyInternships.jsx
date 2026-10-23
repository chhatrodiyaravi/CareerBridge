import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Plus, Trash2, Users } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { apiRequest } from "../../lib/api"
const statusLabels = { published: "Active", draft: "Draft", closed: "Closed" }
const statusColors = {
  Active: "bg-green-50 text-green-700 border-green-200",
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Closed: "bg-red-50 text-red-600 border-red-200",
}
export default function MyInternships() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  async function loadInternships() {
    setLoading(true)
    setError("")
    try {
      const result = await apiRequest("/internships/company/mine")
      setList(result.internships)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load internships.",
      )
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void loadInternships()
  }, [])
  async function closeInternship(id) {
    setError("")
    try {
      await apiRequest(`/internships/company/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      setList((current) =>
        current.map((internship) =>
          internship.id === id
            ? { ...internship, status: "closed" }
            : internship,
        ),
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to close the internship.",
      )
    }
  }
  return (
    <DashboardLayout role="company">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold text-slate-900"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            My Internships
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {list.length} internships posted
          </p>
        </div>
        <button
          onClick={() => navigate("/company/create")}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
        >
          <Plus size={16} /> Create Internship
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Loading internships…
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((internship) => {
            const status = statusLabels[internship.status]
            return (
              <article
                key={internship.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2
                      className="text-sm font-semibold text-slate-800"
                      style={{ fontFamily: "'Outfit',sans-serif" }}
                    >
                      {internship.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {internship.location || "Location not specified"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColors[status]}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {internship.mode}
                  </span>
                  {internship.duration && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {internship.duration}
                    </span>
                  )}
                </div>

                <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
                  <Users size={13} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-600">
                    {internship.applicantCount} applicants
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400">
                    {internship.openings} openings
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      navigate(
                        `/company/create?edit=${encodeURIComponent(internship.id)}`,
                      )
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/company/applicants?internship=${encodeURIComponent(internship.id)}`,
                      )
                    }
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View applicants
                  </button>
                  {internship.status !== "closed" && (
                    <button
                      onClick={() => void closeInternship(internship.id)}
                      aria-label={`Close ${internship.title}`}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={12} /> Close
                    </button>
                  )}
                </div>
              </article>
            )
          })}
          {!list.length && (
            <p className="col-span-full rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500">
              No internships yet. Create your first posting to get started.
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
