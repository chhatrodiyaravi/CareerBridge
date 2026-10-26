import { useEffect, useState } from "react"

import { apiRequest, apiUpload } from "../lib/api"

const maxFileSize = 5 * 1024 * 1024

export default function MediaUpload({
  label,

  kind,

  existingFile,

  fileName,

  uploadPath,

  deletePath,

  viewPath,

  onChange,

  showImagePreview = true,

  disabled = false,
}) {
  const [selectedFile, setSelectedFile] = useState(null)

  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState("")

  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("")

      return
    }

    const url = URL.createObjectURL(selectedFile)

    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  const accept =
    kind === "image" ? "image/jpeg,image/png,image/webp" : "application/pdf"

  function selectFile(event) {
    const file = event.target.files?.[0]

    event.target.value = ""

    setError("")

    if (!file) return

    if (file.size > maxFileSize) {
      setError("Files must be 5 MB or smaller.")

      return
    }

    const validType =
      kind === "image"
        ? ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        : file.type === "application/pdf"

    if (!validType) {
      setError(
        kind === "image"
          ? "Choose a JPEG, PNG, or WebP image."
          : "Choose a PDF file.",
      )

      return
    }

    setSelectedFile(file)
  }

  async function upload() {
    if (!selectedFile) return

    setSubmitting(true)

    setError("")

    try {
      const result = await apiUpload(uploadPath, selectedFile)

      setSelectedFile(null)

      onChange?.(result.file ?? result.resume)

      if (result.cleanupWarning) {
        setError(
          "The upload succeeded, but the previous file could not be removed.",
        )
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to upload ${label.toLowerCase()}.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function remove() {
    setSubmitting(true)

    setError("")

    try {
      const result = await apiRequest(deletePath, { method: "DELETE" })

      setSelectedFile(null)

      onChange?.(null)
      if (result.cleanupWarning) {
        setError(
          "The file was removed from your profile, but Cloudinary cleanup failed.",
        )
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to delete ${label.toLowerCase()}.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  const imageSource = previewUrl || existingFile?.url

  const currentName =
    selectedFile?.name || existingFile?.originalName || fileName

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      {kind === "image" && showImagePreview && imageSource ? (
        <img
          src={imageSource}
          alt={`${label} preview`}
          className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
        />
      ) : null}
      {kind === "pdf" && currentName ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="max-w-full truncate text-sm text-slate-700">
            {currentName}
          </span>
          {existingFile && viewPath && (
            <a
              href={viewPath}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View PDF
            </a>
          )}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          {existingFile
            ? `Choose ${kind === "pdf" ? "replacement" : "new image"}`
            : `Choose ${kind === "pdf" ? "PDF" : "image"}`}
          <input
            type="file"
            accept={accept}
            onChange={selectFile}
            disabled={disabled || submitting}
            className="sr-only"
          />
        </label>
        {selectedFile && (
          <button
            type="button"
            onClick={() => void upload()}
            disabled={disabled || submitting}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Uploading…" : existingFile ? "Replace" : "Upload"}
          </button>
        )}
        {existingFile && (
          <button
            type="button"
            onClick={() => void remove()}
            disabled={disabled || submitting}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400">
        {kind === "image"
          ? "JPEG, PNG, or WebP. Maximum size 5 MB."
          : "PDF only. Maximum size 5 MB."}
      </p>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
