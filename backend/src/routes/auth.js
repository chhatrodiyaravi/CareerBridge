import { Router } from "express"

import bcrypt from "bcryptjs"

import {
  clearSessionCookie,
  createSessionCookie,
  requireAuth,
} from "../middleware/auth.js"

import User from "../models/User.js"

const router = Router()

function publicUser(user) {
  return {
    id: user.id,

    name: user.name,

    email: user.email,

    role: user.role,

    studentProfile: user.studentProfile,

    companyProfile: user.companyProfile,

    settings: user.settings,
  }
}

router.post("/register", async (request, response) => {
  const name =
    typeof request.body?.name === "string" ? request.body.name.trim() : ""

  const email =
    typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase()
      : ""

  const password =
    typeof request.body?.password === "string" ? request.body.password : ""

  const role = request.body?.role

  if (!name || name.length > 120) {
    return response
      .status(400)
      .json({ message: "Enter a name between 1 and 120 characters." })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response
      .status(400)
      .json({ message: "Enter a valid email address." })
  }

  if (password.length < 8 || password.length > 72) {
    return response
      .status(400)
      .json({ message: "Password must be between 8 and 72 characters." })
  }

  if (!["student", "company"].includes(role)) {
    return response
      .status(400)
      .json({ message: "Choose a valid account type." })
  }

  const existingUser = await User.exists({ email })

  if (existingUser) {
    return response
      .status(409)
      .json({ message: "An account with this email already exists." })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,

    email,

    passwordHash,

    role,

    ...(role === "company" ? { companyProfile: { companyName: name } } : {}),
  })

  createSessionCookie(response, user.id, user.role)

  return response.status(201).json({ user: publicUser(user) })
})

router.post("/login", async (request, response) => {
  const email =
    typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase()
      : ""

  const password =
    typeof request.body?.password === "string" ? request.body.password : ""

  if (!email || !password) {
    return response
      .status(400)
      .json({ message: "Enter your email and password." })
  }

  const user = await User.findOne({ email }).select("+passwordHash")

  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false

  if (!user || !passwordMatches || user.status !== "active") {
    return response
      .status(401)
      .json({ message: "Email or password is incorrect." })
  }

  createSessionCookie(response, user.id, user.role)

  return response.json({ user: publicUser(user) })
})

router.post("/logout", (_request, response) => {
  clearSessionCookie(response)

  return response.json({ message: "Signed out." })
})

router.get("/me", requireAuth, async (request, response) => {
  return response.json({ user: publicUser(request.user) })
})

export default router
