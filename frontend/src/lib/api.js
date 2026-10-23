export class ApiError extends Error {
  status
  constructor(message, status) {
    super(message)
    this.name = "ApiError"
    this.status = status
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
