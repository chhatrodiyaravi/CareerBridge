import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { useAuth } from "../../auth/AuthContext"
export default function MySkills() {
  const { user, updateProfile } = useAuth()
  const [skill, setSkill] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const skills = user?.studentProfile?.skills ?? []
  async function saveSkills(nextSkills) {
    setSubmitting(true)
    setError("")
    try {
      await updateProfile({ studentProfile: { skills: nextSkills } })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update your skills.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  async function addSkill(event) {
    event.preventDefault()
    const normalized = skill.trim()
    if (
      !normalized ||
      skills.some(
        (existing) => existing.toLowerCase() === normalized.toLowerCase(),
      )
    )
      return
    await saveSkills([...skills, normalized])
    setSkill("")
  }
  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          My Skills
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {skills.length} skills saved to your profile
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

      <form
        onSubmit={addSkill}
        className="mb-5 flex gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      >
        <input
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
          maxLength={80}
          placeholder="Add a skill, e.g. React"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="submit"
          disabled={submitting || !skill.trim()}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus size={16} /> Add Skill
        </button>
      </form>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Saved Skills</h2>
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
              >
                {item}
                <button
                  type="button"
                  onClick={() =>
                    void saveSkills(skills.filter((value) => value !== item))
                  }
                  disabled={submitting}
                  aria-label={`Remove ${item}`}
                  className="text-blue-500 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            Add your skills to see relevant internship matches.
          </p>
        )}
      </section>
    </DashboardLayout>
  )
}
