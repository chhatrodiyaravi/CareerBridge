import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { apiRequest } from "../../lib/api"
import { CircularProgress } from "../../components/SkillMatchCard"
export default function InternshipDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [internship, setInternship] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  useEffect(() => {
    if (!id) {
      setError("Internship not found.")
      setLoading(false)
      return
    }
    apiRequest(`/internships/${encodeURIComponent(id)}`)
      .then((result) => setInternship(result.internship))
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load internship.",
        ),
      )
      .finally(() => setLoading(false))
  }, [id])
  async function apply(event) {
    event?.preventDefault()
    if (!id) return
    setSubmitting(true)
    setError("")
    try {
      await apiRequest(`/internships/${encodeURIComponent(id)}/applications`, {
        method: "POST",
        body: JSON.stringify({ coverLetter, resumeUrl }),
      })
      setApplicationOpen(false)
      setInternship((current) =>
        current ? { ...current, hasApplied: true } : current,
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to submit your application.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  if (loading) {
    return (
      <DashboardLayout role="student">
        <p className="text-sm text-slate-500">Loading internship…</p>
      </DashboardLayout>
    )
  }
  if (!internship) {
    return (
      <DashboardLayout role="student">
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error || "Internship not found."}
        </p>
        <button
          onClick={() => navigate("/student/internships")}
          className="text-sm font-semibold text-blue-600"
        >
          Back to internships
        </button>
      </DashboardLayout>
    )
  }
  const companyInitials = internship.company.slice(0, 2).toUpperCase()
  return (
    <DashboardLayout role="student">
      <button
        onClick={() => navigate("/student/internships")}
        className="mb-5 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Back to Internships
      </button>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            {companyInitials}
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className="mb-1 text-2xl font-extrabold text-slate-900"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              {internship.title}
            </h1>
            <p className="mb-3 text-sm text-slate-500">{internship.company}</p>
            <div className="flex flex-wrap gap-2">
              {[
                internship.location,
                internship.mode,
                internship.duration,
                internship.stipend,
              ]
                .filter(Boolean)
                .map((value) => (
                  <span
                    key={value}
                    className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-600"
                  >
                    {value}
                  </span>
                ))}
            </div>
          </div>
          {!internship.hasApplied && (
            <button
              type="button"
              onClick={() => setApplicationOpen((open) => !open)}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {applicationOpen ? "Cancel Application" : "Apply Now"}
            </button>
          )}
          {internship.hasApplied && (
            <span className="rounded-xl bg-green-50 px-6 py-3 text-sm font-semibold text-green-700">
              Application submitted
            </span>
          )}
        </div>
      </div>

      {applicationOpen && !internship.hasApplied && (
        <form
          onSubmit={(event) => void apply(event)}
          className="mb-5 space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-800">
            Complete your application
          </h2>
          <div>
            <label
              htmlFor="resume-url"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Resume URL
            </label>
            <input
              id="resume-url"
              type="url"
              value={resumeUrl}
              onChange={(event) => setResumeUrl(event.target.value)}
              placeholder="https://example.com/my-resume.pdf"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">
              Optional. Use a link that the hiring team can access.
            </p>
          </div>
          <div>
            <label
              htmlFor="cover-letter"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Cover letter
            </label>
            <textarea
              id="cover-letter"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              maxLength={5000}
              rows={5}
              placeholder="Tell the company why you're interested in this internship."
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </form>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2
              className="mb-4 text-lg font-bold text-slate-800"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              About This Internship
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {internship.description}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2
                className="text-lg font-bold text-slate-800"
                style={{ fontFamily: "'Outfit',sans-serif" }}
              >
                Your Skill Match
              </h2>
              <span className="text-sm font-semibold text-blue-600">
                {internship.match}%
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <CircularProgress match={internship.match} />
              <div className="flex-1 space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    Matched Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {internship.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {internship.matchedSkills.length === 0 && (
                      <span className="text-sm text-slate-400">
                        Add skills to your profile to see matches.
                      </span>
                    )}
                  </div>
                </div>
                {internship.missingSkills.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      Skills to develop
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {internship.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-800">
              Application Details
            </h2>
            <div className="space-y-3">
              {[
                {
                  icon: Calendar,
                  label: "Deadline",
                  value: internship.deadline
                    ? new Date(internship.deadline).toLocaleDateString()
                    : "Not specified",
                },
                {
                  icon: Clock,
                  label: "Duration",
                  value: internship.duration || "Not specified",
                },
                {
                  icon: Users,
                  label: "Openings",
                  value: `${internship.openings} positions`,
                },
                { icon: Building2, label: "Type", value: internship.type },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={15} className="text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-slate-800">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <MapPin size={15} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="text-sm font-medium text-slate-800">
                    {internship.location || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              About {internship.company}
            </h2>
            {internship.companyProfile.industry && (
              <p className="mb-2 text-xs text-slate-400">
                {internship.companyProfile.industry}
              </p>
            )}
            <p className="text-sm leading-relaxed text-slate-600">
              {internship.companyProfile.description ||
                "Company profile details have not been added yet."}
            </p>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  )
}
