import { Router } from "express"

import { requireAuth, requireRole } from "../middleware/auth.js"

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

function isOptionalString(value, maxLength) {
  return (
    value === undefined ||
    (typeof value === "string" && value.trim().length <= maxLength)
  )
}

router.put(
  "/",
  requireAuth,
  requireRole("student", "company"),
  async (request, response) => {
    const user = request.user

    const { name, studentProfile, companyProfile } = request.body ?? {}

    if (!isOptionalString(name, 120) || (name !== undefined && !name.trim())) {
      return response
        .status(400)
        .json({ message: "Name must be between 1 and 120 characters." })
    }

    if (name !== undefined) user.name = name.trim()

    if (user.role === "student" && studentProfile !== undefined) {
      if (
        !studentProfile ||
        typeof studentProfile !== "object" ||
        Array.isArray(studentProfile)
      ) {
        return response
          .status(400)
          .json({ message: "Student profile must be an object." })
      }

      const { phone, location, education, skills } = studentProfile ?? {}

      if (!isOptionalString(phone, 80) || !isOptionalString(location, 160)) {
        return response
          .status(400)
          .json({ message: "Phone or location is too long." })
      }

      if (
        skills !== undefined &&
        (!Array.isArray(skills) ||
          skills.some(
            (skill) => typeof skill !== "string" || skill.trim().length > 80,
          ))
      ) {
        return response
          .status(400)
          .json({
            message: "Skills must be a list of names up to 80 characters each.",
          })
      }

      if (education !== undefined) {
        if (
          !education ||
          typeof education !== "object" ||
          Array.isArray(education)
        ) {
          return response
            .status(400)
            .json({ message: "Education must be an object." })
        }

        if (
          ["degree", "college", "university"].some(
            (field) => !isOptionalString(education[field], 160),
          )
        ) {
          return response
            .status(400)
            .json({
              message: "Education fields must be 160 characters or fewer.",
            })
        }
      }

      if (
        education?.graduationYear !== undefined &&
        (!Number.isInteger(Number(education.graduationYear)) ||
          Number(education.graduationYear) < 1900 ||
          Number(education.graduationYear) > 2200)
      ) {
        return response
          .status(400)
          .json({ message: "Enter a valid graduation year." })
      }

      user.studentProfile = {
        ...(user.studentProfile?.toObject?.() ?? user.studentProfile ?? {}),

        ...(phone !== undefined ? { phone: phone.trim() } : {}),

        ...(location !== undefined ? { location: location.trim() } : {}),

        ...(education !== undefined ? { education } : {}),

        ...(skills !== undefined
          ? {
              skills: [
                ...new Set(skills.map((skill) => skill.trim()).filter(Boolean)),
              ],
            }
          : {}),
      }
    }

    if (user.role === "company" && companyProfile !== undefined) {
      if (
        !companyProfile ||
        typeof companyProfile !== "object" ||
        Array.isArray(companyProfile)
      ) {
        return response
          .status(400)
          .json({ message: "Company profile must be an object." })
      }

      const allowedFields = [
        "companyName",
        "industry",
        "website",
        "location",
        "companySize",
        "contactEmail",
        "phone",
        "description",
      ]

      const profile = {
        ...(user.companyProfile?.toObject?.() ?? user.companyProfile ?? {}),
      }

      for (const field of allowedFields) {
        const value = companyProfile[field]

        if (value === undefined) continue

        const maxLength =
          field === "description"
            ? 5000
            : field === "website" || field === "contactEmail"
              ? 254
              : 160

        if (typeof value !== "string" || value.trim().length > maxLength) {
          return response
            .status(400)
            .json({
              message: `${field} must be a string of at most ${maxLength} characters.`,
            })
        }

        profile[field] = value.trim()
      }

      user.companyProfile = profile
    }

    await user.save()

    return response.json({ user: publicUser(user) })
  },
)

export default router
