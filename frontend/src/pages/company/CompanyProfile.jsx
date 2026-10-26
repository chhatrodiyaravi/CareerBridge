import { useState } from "react"
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Save,
  Users,
} from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import MediaUpload from "../../components/MediaUpload"
import { useAuth } from "../../auth/AuthContext"
export default function CompanyProfile() {
  const { user, updateProfile, refreshSession } = useAuth()
  const profile = user?.companyProfile ?? {}
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    companyName: profile.companyName ?? "",
    industry: profile.industry ?? "",
    website: profile.website ?? "",
    location: profile.location ?? "",
    companySize: profile.companySize ?? "",
    contactEmail: profile.contactEmail ?? user?.email ?? "",
    phone: profile.phone ?? "",
    description: profile.description ?? "",
  })
  async function saveProfile() {
    setSubmitting(true)
    setError("")
    try {
      await updateProfile({ companyProfile: form })
      setEditing(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save company profile.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  const fields = [
    { key: "industry", label: "Industry", icon: Building2 },
    { key: "website", label: "Website", icon: Globe },
    { key: "location", label: "Location", icon: MapPin },
    { key: "companySize", label: "Company Size", icon: Users },
    { key: "contactEmail", label: "Contact Email", icon: Mail },
    { key: "phone", label: "Phone", icon: Phone },
  ]
  return (
    <DashboardLayout role="company">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="mb-2 flex items-center justify-between">
          <h1
            className="text-2xl font-extrabold text-slate-900"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Company Profile
          </h1>
          {editing ? (
            <button
              onClick={() => void saveProfile()}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save size={14} />
              {submitting ? "Saving…" : "Save Changes"}
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

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-3 flex flex-wrap items-end gap-4">
              {profile.logo?.url ? (
                <img
                  src={profile.logo.url}
                  alt={`${profile.companyName || user?.name} logo`}
                  className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-contain shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-lg">
                  {(form.companyName || user?.name || "C")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              {editing && (
                <MediaUpload
                  label="Company logo"
                  kind="image"
                  existingFile={profile.logo}
                  uploadPath="/uploads/company-logo"
                  deletePath="/uploads/company-logo"
                  onChange={() => void refreshSession()}
                  showImagePreview={false}
                  disabled={submitting}
                />
              )}
            </div>
            {editing ? (
              <input
                value={form.companyName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    companyName: event.target.value,
                  }))
                }
                maxLength={160}
                placeholder="Company name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xl font-bold text-slate-900"
              />
            ) : (
              <h2
                className="text-xl font-extrabold text-slate-900"
                style={{ fontFamily: "'Outfit',sans-serif" }}
              >
                {profile.companyName || user?.name}
              </h2>
            )}
            <p className="mt-1 text-sm text-slate-500">
              {[profile.industry, profile.location]
                .filter(Boolean)
                .join(" • ") || "Add your company details"}
            </p>
            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                profile.verificationStatus === "verified"
                  ? "bg-green-50 text-green-700"
                  : profile.verificationStatus === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {profile.verificationStatus === "verified"
                ? "Verified"
                : profile.verificationStatus === "rejected"
                  ? "Verification rejected"
                  : "Verification pending"}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">
            About the Company
          </h3>
          {editing ? (
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              maxLength={5000}
              rows={4}
              placeholder="Describe your company"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {profile.description || "No company description added."}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">Company Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Icon size={12} />
                  {label}
                </label>
                {editing ? (
                  <input
                    type={
                      key === "website" || key === "contactEmail"
                        ? key === "website"
                          ? "url"
                          : "email"
                        : "text"
                    }
                    value={form[key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                ) : (
                  <p className="text-sm text-slate-700">
                    {profile[key] || "Not provided"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
