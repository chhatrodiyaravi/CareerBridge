import axios from "axios"

export class ApiError extends Error {
  status
  constructor(message, status) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiUpload(path, file, fields = {}) {
  const formData = new FormData()
  if (file) formData.append("file", file)
  for (const [name, value] of Object.entries(fields)) {
    formData.append(name, value)
  }
  try {
    const response = await axios.post(`/api${path}`, formData, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message ?? "The file could not be uploaded.",
      error.response?.status ?? 0,
    )
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new ApiError(
      payload.message ?? "The request could not be completed.",
      response.status,
    )
  }
  return payload
}
