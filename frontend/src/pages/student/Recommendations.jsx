import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, ChevronRight, TrendingUp } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { useAuth } from "../../auth/AuthContext"
import { apiRequest } from "../../lib/api"
function MatchRing({ match }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const color = match >= 90 ? "#16a34a" : match >= 70 ? "#2563EB" : "#d97706"
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="54" height="54" className="-rotate-90">
        <circle
          cx="27"
          cy="27"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="5"
        />
        <circle
          cx="27"
          cy="27"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (match / 100) * circumference}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>
        {match}%
      </span>
    </div>
  )
}
export default function Recommendations() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const skills = user?.studentProfile?.skills ?? []
  useEffect(() => {
    apiRequest("/internships")
      .then((result) => setInternships(result.internships))
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load recommendations.",
        ),
      )
      .finally(() => setLoading(false))
  }, [])
  const topMatches = useMemo(
    () => [...internships].sort((a, b) => b.match - a.match).slice(0, 4),
    [internships],
  )
  const skillGaps = useMemo(() => {
    const counts = new Map()
    for (const internship of internships) {
      for (const skill of internship.missingSkills)
        counts.set(skill, (counts.get(skill) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [internships])
  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Recommendations for You
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Recommendations are calculated from your profile and current
          internship listings.
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

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Skills in your profile", value: skills.length },
          { label: "Published internships", value: internships.length },
          { label: "Skills to develop", value: skillGaps.length },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium text-slate-400">{item.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="font-bold text-slate-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Top Matching Internships
          </h2>
          <button
            onClick={() => navigate("/student/internships")}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            View All <ChevronRight size={13} />
          </button>
        </div>
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Loading recommendations…
          </p>
        ) : (
          <div className="space-y-3">
            {topMatches.map((internship) => (
              <button
                key={internship.id}
                onClick={() =>
                  navigate(
                    `/student/internships/${encodeURIComponent(internship.id)}`,
                  )
                }
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 p-3.5 text-left transition-all hover:border-blue-200 hover:bg-blue-50/30"
              >
                <MatchRing match={internship.match} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {internship.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {internship.company}
                    {internship.location ? ` • ${internship.location}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-blue-600">
                  View
                </span>
              </button>
            ))}
            {!topMatches.length && (
              <p className="py-6 text-center text-sm text-slate-500">
                No published internships are available yet.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-600" />
          <h2
            className="font-bold text-slate-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Most Requested Skills Missing From Your Profile
          </h2>
        </div>
        {skillGaps.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {skillGaps.map(([skill, count]) => (
              <div
                key={skill}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <p className="font-semibold text-slate-800">{skill}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Required by {count} listed{" "}
                  {count === 1 ? "internship" : "internships"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-5 text-center text-sm text-slate-500">
            {skills.length
              ? "Your skills cover the listed internship requirements."
              : "Add skills to your profile to discover skill gaps."}
          </p>
        )}
      </section>

      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white">
        <div className="mb-3 flex items-center gap-3">
          <TrendingUp size={20} />
          <h2 className="text-lg font-bold">Keep Your Profile Current</h2>
        </div>
        <p className="mb-4 text-sm text-indigo-100">
          Your match scores update from your saved skills and published
          internship requirements.
        </p>
        <button
          onClick={() => navigate("/student/skills")}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          Update my skills
        </button>
      </div>
    </DashboardLayout>
  )
}
