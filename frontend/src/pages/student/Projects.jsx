import { useEffect, useState } from "react"
import { ExternalLink, GitFork, Plus, Trash2, X } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import MediaUpload from "../../components/MediaUpload"
import { apiRequest } from "../../lib/api"
const emptyProject = {
  name: "",
  description: "",
  technologies: "",
  githubUrl: "",
  demoUrl: "",
}
export default function MyProjects() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyProject)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => {
    apiRequest("/projects")
      .then((result) => setProjects(result.projects))
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load projects.",
        ),
      )
      .finally(() => setLoading(false))
  }, [])
  function startAdd() {
    setEditingId(null)
    setForm(emptyProject)
    setShowModal(true)
  }
  function startEdit(project) {
    setEditingId(project.id)
    setForm({
      name: project.name,
      description: project.description ?? "",
      technologies: project.technologies.join(", "),
      githubUrl: project.githubUrl ?? "",
      demoUrl: project.demoUrl ?? "",
    })
    setShowModal(true)
  }
  async function saveProject(event) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    const payload = {
      ...form,
      technologies: form.technologies
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean),
    }
    try {
      if (editingId) {
        const result = await apiRequest(
          `/projects/${encodeURIComponent(editingId)}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        )
        setProjects((current) =>
          current.map((project) =>
            project.id === editingId ? result.project : project,
          ),
        )
      } else {
        const result = await apiRequest("/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        setProjects((current) => [result.project, ...current])
      }
      setShowModal(false)
      setForm(emptyProject)
      setEditingId(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save this project.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  async function deleteProject(id) {
    setError("")
    try {
      const result = await apiRequest(`/projects/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      setProjects((current) => current.filter((project) => project.id !== id))
      if (result.cleanupWarning) {
        setError(
          "Project deleted, but its image could not be removed from Cloudinary.",
        )
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete this project.",
      )
    }
  }
  return (
    <DashboardLayout role="student">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold text-slate-900"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            My Projects
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {projects.length} projects saved to your profile
          </p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
        >
          <Plus size={16} /> Add Project
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
          Loading projects…
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-32 items-center justify-center bg-blue-50">
                {project.image?.url ? (
                  <img
                    src={project.image.url}
                    alt={`${project.name} project`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-extrabold text-white shadow-lg">
                    {project.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute ml-52 mt-[-5rem] flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(project)}
                    aria-label={`Edit ${project.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-blue-50"
                  >
                    <span className="text-xs text-blue-600">Edit</span>
                  </button>
                  <button
                    onClick={() => void deleteProject(project.id)}
                    aria-label={`Delete ${project.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-red-50"
                  >
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h2
                  className="mb-1.5 font-bold text-slate-900"
                  style={{ fontFamily: "'Outfit',sans-serif" }}
                >
                  {project.name}
                </h2>
                <p className="mb-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-500">
                  {project.description || "No description provided."}
                </p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {project.technologies.map((technology) => (
                    <span
                      key={technology}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <GitFork size={13} /> Source
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <ExternalLink size={13} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
          {!projects.length && (
            <p className="col-span-full rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500">
              No projects yet. Add a project to showcase your work.
            </p>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveProject}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingId ? "Edit Project" : "Add Project"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 hover:bg-slate-100"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              {editingId ? (
                <MediaUpload
                  label="Project image"
                  kind="image"
                  existingFile={
                    projects.find((project) => project.id === editingId)?.image
                  }
                  uploadPath={`/uploads/projects/${encodeURIComponent(editingId)}/image`}
                  deletePath={`/uploads/projects/${encodeURIComponent(editingId)}/image`}
                  onChange={(image) =>
                    setProjects((current) =>
                      current.map((project) =>
                        project.id === editingId
                          ? { ...project, image: image ?? undefined }
                          : project,
                      ),
                    )
                  }
                />
              ) : (
                <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                  Save the project first to upload its image.
                </p>
              )}
              <label className="block text-xs font-semibold text-slate-600">
                Project Name
                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Description
                <textarea
                  maxLength={2000}
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Technologies
                <input
                  value={form.technologies}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      technologies: event.target.value,
                    }))
                  }
                  placeholder="React, Node.js, MongoDB"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Source URL
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      githubUrl: event.target.value,
                    }))
                  }
                  placeholder="https://github.com/..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Live Demo URL
                <input
                  type="url"
                  value={form.demoUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      demoUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save Project"}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  )
}
