import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Plus, X, Save, Send } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { apiRequest } from "../../lib/api"
const suggestedSkills = [
  "React",
  "Node.js",
  "MongoDB",
  "JavaScript",
  "TypeScript",
  "Python",
  "Django",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Express.js",
  "Angular",
  "Vue.js",
  "GraphQL",
  "Redis",
]
export default function CreateInternship() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editingId = searchParams.get("edit")
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState("")
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    mode: "Remote",
    duration: "",
    type: "Full-time",
    deadline: "",
    openings: "1",
    stipend: "",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(Boolean(editingId))
  const [existingStatus, setExistingStatus] = useState("draft")
  useEffect(() => {
    if (!editingId) return
    let cancelled = false
    apiRequest("/internships/company/mine")
      .then((result) => {
        if (cancelled) return
        const internship = result.internships.find(
          (item) => item.id === editingId,
        )
        if (!internship) {
          setError("The internship could not be found in your listings.")
          return
        }
        setForm({
          title: internship.title,
          description: internship.description,
          location: internship.location,
          mode: internship.mode,
          duration: internship.duration,
          type: internship.type,
          deadline: internship.deadline ? internship.deadline.slice(0, 10) : "",
          openings: String(internship.openings),
          stipend: internship.stipend,
        })
        setSkills(internship.requiredSkills)
        setExistingStatus(internship.status)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load the internship.",
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [editingId])
  const addSkill = (s) => {
    if (s.trim() && !skills.includes(s.trim()))
      setSkills((prev) => [...prev, s.trim()])
    setSkillInput("")
  }
  async function saveInternship(status) {
    setError("")
    if (!form.title.trim() || !form.description.trim()) {
      setError("Enter an internship title and description.")
      return
    }
    setSubmitting(true)
    try {
      await apiRequest(
        editingId
          ? `/internships/company/${encodeURIComponent(editingId)}`
          : "/internships/company",
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify({
            ...form,
            openings: Number(form.openings),
            requiredSkills: skills,
            status,
          }),
        },
      )
      navigate("/company/internships")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the internship.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <DashboardLayout role="company">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-extrabold text-slate-900"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              {editingId ? "Edit Internship" : "Create Internship"}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {editingId
                ? "Update your internship opportunity"
                : "Post a new internship opportunity"}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">
            Loading internship…
          </p>
        ) : (
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2
                className="font-semibold text-slate-800 mb-4"
                style={{ fontFamily: "'Outfit',sans-serif" }}
              >
                Basic Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Internship Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. MERN Stack Developer Intern"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={4}
                    placeholder="Describe the internship role, responsibilities, and what interns will learn..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Location
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, location: e.target.value }))
                    }
                    placeholder="e.g. Ahmedabad"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Work Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Remote", "Hybrid", "On-site"].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setForm((p) => ({ ...p, mode: m }))}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                          form.mode === m
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Duration
                  </label>
                  <input
                    value={form.duration}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, duration: e.target.value }))
                    }
                    placeholder="e.g. 6 Months"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Internship Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  >
                    {["Full-time", "Part-time", "Contract"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, deadline: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Number of Openings
                  </label>
                  <input
                    type="number"
                    value={form.openings}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, openings: e.target.value }))
                    }
                    min="1"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Stipend
                  </label>
                  <input
                    value={form.stipend}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stipend: e.target.value }))
                    }
                    placeholder="e.g. ₹15,000/month"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Required Skills */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2
                className="font-semibold text-slate-800 mb-4"
                style={{ fontFamily: "'Outfit',sans-serif" }}
              >
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {s}{" "}
                    <button
                      onClick={() =>
                        setSkills((p) => p.filter((sk) => sk !== s))
                      }
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill(skillInput)
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills
                    .filter((s) => !skills.includes(s))
                    .slice(0, 8)
                    .map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => addSkill(s)}
                        className="text-xs text-slate-600 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 px-3 py-1 rounded-full transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <div className="flex gap-3">
              {(!editingId || existingStatus !== "published") && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    void saveInternship(editingId ? existingStatus : "draft")
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <Save size={15} />{" "}
                  {editingId ? "Save Changes" : "Save as Draft"}
                </button>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={() => void saveInternship("published")}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm shadow-blue-200 disabled:opacity-50"
              >
                <Send size={15} />{" "}
                {submitting
                  ? "Saving…"
                  : editingId && existingStatus === "published"
                    ? "Save Changes"
                    : editingId
                      ? "Publish Changes"
                      : "Publish Internship"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
