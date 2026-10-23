import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Search, Filter, MapPin, Clock } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { apiRequest } from "../../lib/api"
const modeColors = {
  Remote: "bg-green-50 text-green-700 border-green-200",
  Hybrid: "bg-amber-50 text-amber-700 border-amber-200",
  "On-site": "bg-blue-50 text-blue-700 border-blue-200",
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
  const label =
    match >= 90
      ? "Excellent"
      : match >= 70
        ? "Good"
        : match >= 50
          ? "Moderate"
          : "Low"
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">Your Match</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {match}% • {label}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${match}%`, background: color }}
        />
      </div>
    </div>
  )
}
export default function FindInternships() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [internships, setInternships] = useState([])
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [mode, setMode] = useState("All")
  const [minMatch, setMinMatch] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(
      () => {
        const params = new URLSearchParams()
        if (query.trim()) params.set("q", query.trim())
        if (mode !== "All") params.set("mode", mode)
        setLoading(true)
        setError("")
        apiRequest(`/internships${params.size ? `?${params.toString()}` : ""}`)
          .then((result) => {
            if (!cancelled) setInternships(result.internships)
          })
          .catch((requestError) => {
            if (!cancelled) {
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "Unable to load internships.",
              )
            }
          })
          .finally(() => {
            if (!cancelled) setLoading(false)
          })
      },
      query ? 250 : 0,
    )
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [mode, query])
  const filtered = internships.filter((i) => {
    const q = query.toLowerCase()
    const matchesQ =
      !q ||
      i.title.toLowerCase().includes(q) ||
      i.company.toLowerCase().includes(q) ||
      i.requiredSkills.some((s) => s.toLowerCase().includes(q))
    const matchesMatch = i.match >= minMatch
    return matchesQ && matchesMatch
  })
  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Find Internships
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Discover internships that match your skills
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search internships, skills, or companies..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Filters */}
        <div className="lg:w-56 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3
              className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              <Filter size={14} /> Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Work Mode
                </label>
                <div className="space-y-1.5">
                  {["All", "Remote", "Hybrid", "On-site"].map((m) => (
                    <label
                      key={m}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === m}
                        onChange={() => setMode(m)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-slate-600">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Min Match: {minMatch}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={10}
                  value={minMatch}
                  onChange={(e) => setMinMatch(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0%</span>
                  <span>90%+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <p className="text-xs text-slate-500 mb-3 font-medium">
            {loading
              ? "Loading internships…"
              : `${filtered.length} internships found`}
          </p>
          <div className="space-y-4">
            {filtered.map((intern) => (
              <div
                key={intern.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-600 text-white font-bold shrink-0">
                    {intern.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3
                          className="font-bold text-slate-900 text-base"
                          style={{ fontFamily: "'Outfit',sans-serif" }}
                        >
                          {intern.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {intern.company}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${modeColors[intern.mode]}`}
                        >
                          {intern.mode}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 mb-3">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={12} />
                        {intern.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {intern.duration}
                      </span>
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        {intern.stipend}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {intern.requiredSkills.map((s) => (
                        <span
                          key={s}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            intern.matchedSkills.includes(s)
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <MatchBar match={intern.match} />

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() =>
                          navigate(`/student/internships/${intern.id}`)
                        }
                        className="flex-1 sm:flex-none px-5 py-2 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/student/internships/${intern.id}`)
                        }
                        className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
                Loading internships…
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <Search size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-600">
                  No internships found
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
