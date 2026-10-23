import { useState } from "react"
import {
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { useAuth } from "../../auth/AuthContext"
export default function StudentProfile() {
  const { user, updateProfile } = useAuth()
  const profile = user?.studentProfile ?? {}
  const education = profile.education ?? {}
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    degree: education.degree ?? "",
    college: education.college ?? "",
    university: education.university ?? "",
    graduationYear: education.graduationYear?.toString() ?? "",
    skills: profile.skills?.join(", ") ?? "",
  })
  const completedFields = [
    user?.name,
    user?.email,
    profile.phone,
    profile.location,
    education.degree,
    education.college,
    (profile.skills?.length ?? 0) > 0,
  ].filter(Boolean).length
  const completion = Math.round((completedFields / 7) * 100)
  async function saveProfile() {
    setSubmitting(true)
    setError("")
    try {
      await updateProfile({
        name: form.name,
        studentProfile: {
          phone: form.phone,
          location: form.location,
          education: {
            degree: form.degree,
            college: form.college,
            university: form.university,
            ...(form.graduationYear
              ? { graduationYear: Number(form.graduationYear) }
              : {}),
          },
          skills: form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        },
      })
      setEditing(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save your profile.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  const fields = [
    { label: "Phone", value: form.phone, key: "phone", icon: Phone },
    { label: "Location", value: form.location, key: "location", icon: MapPin },
    { label: "Degree", value: form.degree, key: "degree", icon: GraduationCap },
    {
      label: "College",
      value: form.college,
      key: "college",
      icon: GraduationCap,
    },
    {
      label: "University",
      value: form.university,
      key: "university",
      icon: GraduationCap,
    },
    {
      label: "Graduation Year",
      value: form.graduationYear,
      key: "graduationYear",
      icon: GraduationCap,
    },
  ]
  return (
    <DashboardLayout role="student">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-lg">
                {user?.name.charAt(0).toUpperCase() || <UserRound />}
              </div>
              {editing ? (
                <button
                  onClick={() => void saveProfile()}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Save size={14} /> {submitting ? "Saving…" : "Save Changes"}
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit Profile
                </button>
              )}
            </div>
            {editing ? (
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                maxLength={120}
                className="mb-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold text-slate-900"
                aria-label="Full name"
              />
            ) : (
              <h1
                className="mb-0.5 text-xl font-extrabold text-slate-900"
                style={{ fontFamily: "'Outfit',sans-serif" }}
              >
                {user?.name}
              </h1>
            )}
            <p className="text-sm text-slate-500">
              {profile.education?.degree || "Student"}
              {profile.education?.college
                ? ` • ${profile.education.college}`
                : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Mail size={13} />
                {user?.email}
              </span>
              {profile.location && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={13} />
                  {profile.location}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone size={13} />
                  {profile.phone}
                </span>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800">
                  Profile Completion
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {completion}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-blue-200/50">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
              <UserRound size={16} className="text-blue-600" /> Personal
              Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  Email
                </label>
                <p className="text-sm text-slate-700">{user?.email}</p>
              </div>
              {fields.slice(0, 2).map(({ label, value, key, icon: Icon }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    <Icon size={12} className="mr-1 inline" />
                    {label}
                  </label>
                  {editing ? (
                    <input
                      value={value}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  ) : (
                    <p className="text-sm text-slate-700">
                      {value || "Not provided"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
              <GraduationCap size={16} className="text-indigo-600" /> Education
            </h2>
            <div className="space-y-4">
              {fields.slice(2).map(({ label, value, key, icon: Icon }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    <Icon size={12} className="mr-1 inline" />
                    {label}
                  </label>
                  {editing ? (
                    <input
                      value={value}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      type={key === "graduationYear" ? "number" : "text"}
                      min={key === "graduationYear" ? 1900 : undefined}
                      max={key === "graduationYear" ? 2200 : undefined}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  ) : (
                    <p className="text-sm text-slate-700">
                      {value || "Not provided"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-800">Skills</h2>
          {editing ? (
            <textarea
              value={form.skills}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  skills: event.target.value,
                }))
              }
              placeholder="Separate skills with commas"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
              {!profile.skills?.length && (
                <p className="text-sm text-slate-400">No skills added yet.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
