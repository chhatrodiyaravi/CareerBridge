import { Router } from "express"

import mongoose from "mongoose"

import { requireAuth, requireRole } from "../middleware/auth.js"

import Application from "../models/Application.js"

import Internship from "../models/Internship.js"

import User from "../models/User.js"

const router = Router()

const modes = ["Remote", "Hybrid", "On-site"]

const types = ["Full-time", "Part-time", "Contract"]

const statuses = ["draft", "published", "closed"]

function isValidObjectId(id) {
  return mongoose.isValidObjectId(id)
}

function matchesSkills(internship, user) {
  const studentSkills = new Set(
    (user.studentProfile?.skills ?? []).map((skill) => skill.toLowerCase()),
  )

  const requiredSkills = internship.requiredSkills ?? []

  const matchedSkills = requiredSkills.filter((skill) =>
    studentSkills.has(skill.toLowerCase()),
  )

  const match = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0

  return {
    matchedSkills,
    missingSkills: requiredSkills.filter(
      (skill) => !studentSkills.has(skill.toLowerCase()),
    ),
    match,
  }
}

function internshipView(internship, user) {
  const company = internship.company

  const matchData = user
    ? matchesSkills(internship, user)
    : { matchedSkills: [], missingSkills: [], match: 0 }

  const companyName =
    company?.companyProfile?.companyName || company?.name || "Company"

  return {
    id: (internship._id ?? internship.id).toString(),

    title: internship.title,

    company: companyName,

    location: internship.location ?? "",

    mode: internship.mode,

    type: internship.type,

    duration: internship.duration ?? "",

    deadline: internship.deadline ?? null,

    openings: internship.openings,

    stipend: internship.stipend ?? "",

    requiredSkills: internship.requiredSkills ?? [],

    status: internship.status,

    description: internship.description,

    createdAt: internship.createdAt,

    ...matchData,
  }
}

function validateInternshipInput(body, { allowStatus = false } = {}) {
  const errors = []

  const title = typeof body?.title === "string" ? body.title.trim() : ""

  const description =
    typeof body?.description === "string" ? body.description.trim() : ""

  const mode = body?.mode ?? "Remote"

  const type = body?.type ?? "Full-time"

  const openings = Number(body?.openings ?? 1)

  const requiredSkills = body?.requiredSkills

  if (!title || title.length > 160)
    errors.push("Title must be between 1 and 160 characters.")

  if (!description || description.length > 10000)
    errors.push("Description must be between 1 and 10000 characters.")

  if (!modes.includes(mode)) errors.push("Choose a valid work mode.")

  if (!types.includes(type)) errors.push("Choose a valid internship type.")

  if (!Number.isInteger(openings) || openings < 1)
    errors.push("Openings must be a positive whole number.")

  if (
    requiredSkills !== undefined &&
    (!Array.isArray(requiredSkills) ||
      requiredSkills.some(
        (skill) => typeof skill !== "string" || skill.trim().length > 80,
      ))
  ) {
    errors.push("Required skills must be a list of up to 80-character names.")
  }

  if (
    allowStatus &&
    body.status !== undefined &&
    !statuses.includes(body.status)
  ) {
    errors.push("Choose a valid internship status.")
  }

  if (body?.deadline && Number.isNaN(Date.parse(body.deadline))) {
    errors.push("Enter a valid application deadline.")
  }

  return {
    errors,

    values: {
      title,

      description,

      location: typeof body?.location === "string" ? body.location.trim() : "",

      mode,

      duration: typeof body?.duration === "string" ? body.duration.trim() : "",

      type,

      deadline: body?.deadline || undefined,

      openings,

      stipend: typeof body?.stipend === "string" ? body.stipend.trim() : "",

      requiredSkills: Array.isArray(requiredSkills)
        ? [
            ...new Set(
              requiredSkills.map((skill) => skill.trim()).filter(Boolean),
            ),
          ]
        : [],

      ...(allowStatus && body?.status ? { status: body.status } : {}),
    },
  }
}

router.get(
  "/",
  requireAuth,
  requireRole("student"),
  async (request, response) => {
    const { q = "", mode } = request.query

    const filter = { status: "published" }

    if (typeof mode === "string" && mode !== "All") {
      if (!modes.includes(mode))
        return response
          .status(400)
          .json({ message: "Choose a valid work mode." })

      filter.mode = mode
    }

    if (typeof q === "string" && q.trim()) {
      const escapedQuery = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

      const pattern = new RegExp(escapedQuery, "i")
      const matchingCompanies = await User.find({
        role: "company",
        $or: [{ name: pattern }, { "companyProfile.companyName": pattern }],
      }).distinct("_id")

      filter.$or = [
        { title: pattern },
        { location: pattern },
        { requiredSkills: pattern },
        { company: { $in: matchingCompanies } },
      ]
    }

    const internships = await Internship.find(filter)

      .sort({ publishedAt: -1, createdAt: -1 })

      .populate("company", "name companyProfile.companyName")

      .lean()

    return response.json({
      internships: internships.map((internship) =>
        internshipView(internship, request.user),
      ),
    })
  },
)

router.get(
  "/company/analytics",
  requireAuth,
  requireRole("company"),
  async (request, response) => {
    const internships = await Internship.find({ company: request.auth.sub })
      .select("_id title status")
      .lean()
    const internshipIds = internships.map((internship) => internship._id)
    const start = new Date()
    start.setUTCDate(1)
    start.setUTCMonth(start.getUTCMonth() - 5)

    const [applicationCounts, statusCounts, monthlyCounts] = await Promise.all([
      Application.aggregate([
        { $match: { internship: { $in: internshipIds } } },
        { $group: { _id: "$internship", count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { internship: { $in: internshipIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { internship: { $in: internshipIds }, createdAt: { $gte: start } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    const applicantsByInternship = new Map(
      applicationCounts.map(({ _id, count }) => [_id.toString(), count]),
    )
    const applicationsByStatus = Object.fromEntries(
      statusCounts.map(({ _id, count }) => [_id, count]),
    )
    const monthly = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(start)
      date.setUTCMonth(start.getUTCMonth() + index)
      const year = date.getUTCFullYear()
      const month = date.getUTCMonth() + 1
      const entry = monthlyCounts.find(
        (item) => item._id.year === year && item._id.month === month,
      )

      return {
        month: date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
        applications: entry?.count ?? 0,
      }
    })

    return response.json({
      summary: {
        internships: internships.length,
        activeInternships: internships.filter((item) => item.status === "published").length,
        totalApplicants: applicationCounts.reduce((sum, item) => sum + item.count, 0),
      },
      applicationsByStatus,
      monthly,
      internships: internships.map((internship) => ({
        id: internship._id.toString(),
        title: internship.title,
        status: internship.status,
        applicants: applicantsByInternship.get(internship._id.toString()) ?? 0,
      })),
    })
  },
)

router.get(
  "/company/mine",
  requireAuth,
  requireRole("company"),
  async (request, response) => {
    const internships = await Internship.find({ company: request.auth.sub })

      .sort({ createdAt: -1 })

      .populate("company", "name companyProfile.companyName")

      .lean()

    const counts = await Application.aggregate([
      {
        $match: {
          internship: { $in: internships.map((internship) => internship._id) },
        },
      },

      { $group: { _id: "$internship", count: { $sum: 1 } } },
    ])

    const countByInternship = new Map(
      counts.map(({ _id, count }) => [_id.toString(), count]),
    )

    return response.json({
      internships: internships.map((internship) => ({
        ...internshipView(internship),

        applicantCount: countByInternship.get(internship._id.toString()) ?? 0,
      })),
    })
  },
)

router.get(
  "/:id",
  requireAuth,
  requireRole("student"),
  async (request, response) => {
    if (!isValidObjectId(request.params.id)) {
      return response.status(404).json({ message: "Internship not found." })
    }

    const internship = await Internship.findOne({
      _id: request.params.id,
      status: "published",
    })

      .populate(
        "company",
        "name companyProfile.companyName companyProfile.industry companyProfile.description",
      )

      .lean()

    if (!internship)
      return response.status(404).json({ message: "Internship not found." })

    const [application, result] = await Promise.all([
      Application.exists({
        student: request.auth.sub,
        internship: internship._id,
      }),

      Promise.resolve(internshipView(internship, request.user)),
    ])

    return response.json({
      internship: {
        ...result,
        hasApplied: Boolean(application),
        companyProfile: internship.company?.companyProfile ?? {},
      },
    })
  },
)

router.post(
  "/company",
  requireAuth,
  requireRole("company"),
  async (request, response) => {
    const { errors, values } = validateInternshipInput(request.body, {
      allowStatus: true,
    })

    if (errors.length) return response.status(400).json({ message: errors[0] })

    const status = request.body.status === "published" ? "published" : "draft"

    const internship = await Internship.create({
      ...values,

      company: request.auth.sub,

      status,

      publishedAt: status === "published" ? new Date() : undefined,
    })

    return response
      .status(201)
      .json({
        internship: internshipView(
          await internship.populate(
            "company",
            "name companyProfile.companyName",
          ),
        ),
      })
  },
)

router.patch(
  "/company/:id",
  requireAuth,
  requireRole("company"),
  async (request, response) => {
    if (!isValidObjectId(request.params.id))
      return response.status(404).json({ message: "Internship not found." })

    const { errors, values } = validateInternshipInput(request.body, {
      allowStatus: true,
    })

    if (errors.length) return response.status(400).json({ message: errors[0] })

    const internship = await Internship.findOne({
      _id: request.params.id,
      company: request.auth.sub,
    })

    if (!internship)
      return response.status(404).json({ message: "Internship not found." })

    Object.assign(internship, values)

    if (values.status === "published" && !internship.publishedAt)
      internship.publishedAt = new Date()

    if (values.status === "draft") internship.publishedAt = undefined

    await internship.save()

    return response.json({
      internship: internshipView(
        await internship.populate("company", "name companyProfile.companyName"),
      ),
    })
  },
)

router.delete(
  "/company/:id",
  requireAuth,
  requireRole("company"),
  async (request, response) => {
    if (!isValidObjectId(request.params.id))
      return response.status(404).json({ message: "Internship not found." })

    const internship = await Internship.findOneAndUpdate(
      { _id: request.params.id, company: request.auth.sub },

      { status: "closed" },

      { new: true },
    )

    if (!internship)
      return response.status(404).json({ message: "Internship not found." })

    return response.json({ message: "Internship closed." })
  },
)

export default router
