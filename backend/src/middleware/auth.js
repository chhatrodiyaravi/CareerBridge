import jwt from "jsonwebtoken"

import User from "../models/User.js"

const cookieName = "careerbridge_session"

export async function requireAuth(request, response, next) {
  const token = request.cookies?.[cookieName]

  if (!token) {
    return response.status(401).json({ message: "Sign in to continue." })
  }

  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return response
      .status(401)
      .json({ message: "Your session has expired. Sign in again." })
  }

  const user = await User.findById(decoded.sub)

  if (!user || user.status !== "active") {
    return response
      .status(401)
      .json({ message: "Your account is no longer available." })
  }

  request.auth = { sub: user.id, role: user.role }

  request.user = user

  return next()
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.auth?.role)) {
      return response
        .status(403)
        .json({ message: "You do not have permission to do that." })
    }

    return next()
  }
}

export function createSessionCookie(response, userId, role) {
  const token = jwt.sign({ sub: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })

  response.cookie(cookieName, token, {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: "lax",

    maxAge: 7 * 24 * 60 * 60 * 1000,

    path: "/api",
  })
}

export function clearSessionCookie(response) {
  response.clearCookie(cookieName, {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: "lax",

    path: "/api",
  })
}
