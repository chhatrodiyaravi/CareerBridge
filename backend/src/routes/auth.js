import { Router } from "express"

import bcrypt from "bcryptjs"
import { createHmac, randomInt, timingSafeEqual } from "node:crypto"

import {
  clearSessionCookie,
  createSessionCookie,
  requireAuth,
} from "../middleware/auth.js"

import {
  isEmailConfigured,
  sendPasswordResetEmail,
} from "../services/email.js"

import User from "../models/User.js"

const router = Router()

const maxPasswordResetOtpAttempts = 5
const passwordResetOtpLifetimeMs = 10 * 60 * 1000

function hashPasswordResetOtp(otp) {
  return createHmac("sha256", process.env.JWT_SECRET).update(otp).digest("hex")
}

function publicUser(user) {
  const studentProfile =
    user.studentProfile?.toObject?.() ?? user.studentProfile
  const safeStudentProfile = studentProfile
    ? Object.fromEntries(
        Object.entries(studentProfile).filter(([key]) => key !== "resume"),
      )
    : undefined

  return {
    id: user.id,

    name: user.name,

    email: user.email,

    role: user.role,

    studentProfile: safeStudentProfile,

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

router.post("/forgot-password", async (request, response) => {
  if (!isEmailConfigured()) {
    return response.status(503).json({
      message:
        "Password reset email is unavailable. Configure SMTP settings and try again.",
    })
  }

  const email =
    typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase()
      : ""

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response.status(400).json({ message: "Enter a valid email address." })
  }

  const user = await User.findOne({ email, status: "active" })

  if (user) {
    const otp = String(randomInt(100000, 1000000))
    const otpHash = hashPasswordResetOtp(otp)

    user.passwordResetOtpHash = otpHash
    user.passwordResetOtpExpires = new Date(Date.now() + passwordResetOtpLifetimeMs)
    user.passwordResetOtpAttempts = 0
    await user.save()

    try {
      await sendPasswordResetEmail(user.email, user.name, otp)
    } catch (error) {
      await User.updateOne(
        { _id: user._id, passwordResetOtpHash: otpHash },
        {
          $unset: {
            passwordResetOtpHash: 1,
            passwordResetOtpExpires: 1,
          },
          $set: { passwordResetOtpAttempts: 0 },
        },
      )
      console.error("Password reset email delivery failed:", error)
      return response.status(503).json({
        message: "Unable to send the password reset email. Please try again.",
      })
    }
  }

  return response.json({
    message:
      "If an active account exists for that email, you will receive a password reset code.",
  })
})

router.post("/reset-password", async (request, response) => {
  const email =
    typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase()
      : ""
  const otp = typeof request.body?.otp === "string" ? request.body.otp.trim() : ""
  const password =
    typeof request.body?.password === "string" ? request.body.password : ""

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response
      .status(400)
      .json({ message: "Enter a valid email address." })
  }

  if (!/^\d{6}$/.test(otp)) {
    return response
      .status(400)
      .json({ message: "The verification code is invalid or has expired." })
  }

  if (password.length < 8 || password.length > 72) {
    return response
      .status(400)
      .json({ message: "Password must be between 8 and 72 characters." })
  }

  const user = await User.findOne({
    email,
    status: "active",
  }).select(
    "+passwordResetOtpHash +passwordResetOtpExpires +passwordResetOtpAttempts",
  )

  if (
    !user ||
    !user.passwordResetOtpHash ||
    !user.passwordResetOtpExpires ||
    user.passwordResetOtpExpires <= new Date() ||
    user.passwordResetOtpAttempts >= maxPasswordResetOtpAttempts
  ) {
    return response
      .status(400)
      .json({ message: "The verification code is invalid or has expired." })
  }

  const expectedHash = Buffer.from(user.passwordResetOtpHash, "hex")
  const submittedHash = Buffer.from(hashPasswordResetOtp(otp), "hex")
  const otpMatches =
    expectedHash.length === submittedHash.length &&
    timingSafeEqual(expectedHash, submittedHash)

  const matchedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      passwordResetOtpHash: user.passwordResetOtpHash,
      passwordResetOtpExpires: { $gt: new Date() },
      passwordResetOtpAttempts: { $lt: maxPasswordResetOtpAttempts },
      status: "active",
    },
    { $inc: { passwordResetOtpAttempts: 1 } },
  )

  if (!matchedUser || !otpMatches) {
    return response
      .status(400)
      .json({ message: "The verification code is invalid or has expired." })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      passwordResetOtpHash: user.passwordResetOtpHash,
      passwordResetOtpExpires: { $gt: new Date() },
      passwordResetOtpAttempts: { $lte: maxPasswordResetOtpAttempts },
      status: "active",
    },
    {
      $set: { passwordHash, passwordResetOtpAttempts: 0 },
      $unset: {
        passwordResetOtpHash: 1,
        passwordResetOtpExpires: 1,
      },
    },
  )

  if (!updatedUser) {
    return response
      .status(400)
      .json({ message: "The verification code is invalid or has expired." })
  }

  return response.json({
    message: "Your password has been reset. You can now sign in.",
  })
})

router.post("/logout", (_request, response) => {
  clearSessionCookie(response)

  return response.json({ message: "Signed out." })
})

router.get("/me", requireAuth, async (request, response) => {
  return response.json({ user: publicUser(request.user) })
})

export default router
