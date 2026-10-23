import { Router } from "express"

import mongoose from "mongoose"

import { requireAuth, requireRole } from "../middleware/auth.js"

import Application from "../models/Application.js"

import Internship from "../models/Internship.js"

import User from "../models/User.js"

const router = Router()

const managementTypes = ["students", "companies", "internships", "applications"]

router.use(requireAuth, requireRole("admin"))

router.get("/stats", async (_request, response) => {
  const start = new Date()

  start.setDate(1)

  start.setMonth(start.getMonth() - 5)

  const [
    totalStudents,
    totalCompanies,
    activeInternships,
    totalApplications,
    studentMonths,
    applicationMonths,
    skills,
    recentStudents,
    recentCompanies,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),

    User.countDocuments({ role: "company" }),

    Internship.countDocuments({ status: "published" }),

    Application.countDocuments(),

    User.aggregate([
      { $match: { role: "student", createdAt: { $gte: start } } },

      {
        $group: {
          _id: { $dateToString: { format: "%b", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),

    Application.aggregate([
      { $match: { createdAt: { $gte: start } } },

      {
        $group: {
          _id: { $dateToString: { format: "%b", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),

    User.aggregate([
      { $match: { role: "student" } },

      { $unwind: "$studentProfile.skills" },

      { $group: { _id: "$studentProfile.skills", count: { $sum: 1 } } },

      { $sort: { count: -1 } },

      { $limit: 6 },
    ]),

    User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email status studentProfile.education"),

    User.find({ role: "company" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email status companyProfile"),
  ])

  const months = []

  for (let index = 0; index < 6; index += 1) {
    const date = new Date(start)

    date.setMonth(start.getMonth() + index)

    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    })

    months.push({
      month,

      students: studentMonths.find((entry) => entry._id === month)?.count ?? 0,

      applications:
        applicationMonths.find((entry) => entry._id === month)?.count ?? 0,
    })
  }

  return response.json({
    stats: {
      totalStudents,
      totalCompanies,
      activeInternships,
      totalApplications,
    },

    monthly: months,

    topSkills: skills.map(({ _id, count }) => ({ skill: _id, count })),

    recentStudents: recentStudents.map((user) => ({
      id: user.id,

      name: user.name,

      email: user.email,

      status: user.status,

      degree: user.studentProfile?.education?.degree ?? "",

      college: user.studentProfile?.education?.college ?? "",
    })),

    recentCompanies: recentCompanies.map((user) => ({
      id: user.id,

      name: user.companyProfile?.companyName || user.name,

      industry: user.companyProfile?.industry ?? "",

      location: user.companyProfile?.location ?? "",

      status: user.companyProfile?.verificationStatus ?? "pending",
    })),
  })
})

router.get("/management/:type", async (request, response) => {
  const { type } = request.params

  if (!managementTypes.includes(type))
    return response.status(404).json({ message: "Management view not found." })

  if (type === "students") {
    const users = await User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .select("name email status studentProfile createdAt")
      .lean()

    return response.json({
      records: users.map((user) => ({
        id: user._id.toString(),

        name: user.name,

        email: user.email,

        status: user.status,

        degree: user.studentProfile?.education?.degree ?? "",

        college: user.studentProfile?.education?.college ?? "",

        skills: user.studentProfile?.skills ?? [],
      })),
    })
  }

  if (type === "companies") {
    const companies = await User.find({ role: "company" })
      .sort({ createdAt: -1 })
      .select("name email status companyProfile")
      .lean()

    const companyIds = companies.map((company) => company._id)

    const [internshipCounts, applicationCounts] = await Promise.all([
      Internship.aggregate([
        { $match: { company: { $in: companyIds } } },
        { $group: { _id: "$company", count: { $sum: 1 } } },
      ]),

      Application.aggregate([
        {
          $lookup: {
            from: "internships",
            localField: "internship",
            foreignField: "_id",
            as: "internship",
          },
        },

        { $unwind: "$internship" },

        { $match: { "internship.company": { $in: companyIds } } },

        { $group: { _id: "$internship.company", count: { $sum: 1 } } },
      ]),
    ])

    const internshipCountByCompany = new Map(
      internshipCounts.map((row) => [row._id.toString(), row.count]),
    )

    const applicantCountByCompany = new Map(
      applicationCounts.map((row) => [row._id.toString(), row.count]),
    )

    return response.json({
      records: companies.map((company) => ({
        id: company._id.toString(),

        name: company.companyProfile?.companyName || company.name,

        email: company.email,

        industry: company.companyProfile?.industry ?? "",

        location: company.companyProfile?.location ?? "",

        verificationStatus:
          company.companyProfile?.verificationStatus ?? "pending",

        internshipCount:
          internshipCountByCompany.get(company._id.toString()) ?? 0,

        applicantCount:
          applicantCountByCompany.get(company._id.toString()) ?? 0,

        status: company.status,
      })),
    })
  }

  if (type === "internships") {
    const internships = await Internship.find()
      .sort({ createdAt: -1 })
      .populate("company", "name companyProfile.companyName")
      .lean()

    return response.json({
      records: internships.map((internship) => ({
        id: internship._id.toString(),

        title: internship.title,

        company:
          internship.company?.companyProfile?.companyName ||
          internship.company?.name ||
          "Company",

        location: internship.location ?? "",

        mode: internship.mode,

        duration: internship.duration ?? "",

        openings: internship.openings,

        status: internship.status,
      })),
    })
  }

  const applications = await Application.find()
    .sort({ createdAt: -1 })

    .populate({ path: "student", select: "name email studentProfile.skills" })

    .populate({
      path: "internship",
      select: "title requiredSkills company",
      populate: { path: "company", select: "name companyProfile.companyName" },
    })

    .lean()

  return response.json({
    records: applications.map((application) => {
      const skills = new Set(
        (application.student?.studentProfile?.skills ?? []).map((skill) =>
          skill.toLowerCase(),
        ),
      )

      const requiredSkills = application.internship?.requiredSkills ?? []

      return {
        id: application._id.toString(),

        company:
          application.internship?.company?.companyProfile?.companyName ||
          application.internship?.company?.name ||
          "Company",

        internship: application.internship?.title ?? "Internship",

        student: application.student?.name ?? "Student",

        date: application.createdAt,

        match: requiredSkills.length
          ? Math.round(
              (requiredSkills.filter((skill) => skills.has(skill.toLowerCase()))
                .length /
                requiredSkills.length) *
                100,
            )
          : 0,

        status: application.status,
      }
    }),
  })
})

router.patch("/users/:id/status", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id))
    return response.status(404).json({ message: "User not found." })

  const { status } = request.body ?? {}

  if (!["active", "inactive"].includes(status))
    return response
      .status(400)
      .json({ message: "Choose a valid account status." })

  const user = await User.findOneAndUpdate(
    { _id: request.params.id, role: { $in: ["student", "company"] } },
    { status },
    { new: true },
  ).select("name status")

  if (!user) return response.status(404).json({ message: "User not found." })

  return response.json({
    user: { id: user.id, name: user.name, status: user.status },
  })
})

router.patch("/companies/:id/verification", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id))
    return response.status(404).json({ message: "Company not found." })

  const { verificationStatus } = request.body ?? {}

  if (!["pending", "verified", "rejected"].includes(verificationStatus)) {
    return response
      .status(400)
      .json({ message: "Choose a valid verification status." })
  }

  const company = await User.findOneAndUpdate(
    { _id: request.params.id, role: "company" },

    { "companyProfile.verificationStatus": verificationStatus },

    { new: true },
  ).select("companyProfile.companyName")

  if (!company)
    return response.status(404).json({ message: "Company not found." })

  return response.json({ verificationStatus })
})

router.patch("/internships/:id/status", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id))
    return response.status(404).json({ message: "Internship not found." })

  const { status } = request.body ?? {}

  if (!["draft", "published", "closed"].includes(status))
    return response
      .status(400)
      .json({ message: "Choose a valid internship status." })

  const internship = await Internship.findByIdAndUpdate(
    request.params.id,
    {
      status,

      ...(status === "published" ? { publishedAt: new Date() } : {}),
    },
    { new: true },
  )

  if (!internship)
    return response.status(404).json({ message: "Internship not found." })

  return response.json({ status: internship.status })
})

router.patch("/applications/:id/status", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id))
    return response.status(404).json({ message: "Application not found." })

  const { status } = request.body ?? {}

  if (
    !["applied", "reviewed", "shortlisted", "rejected", "selected"].includes(
      status,
    )
  ) {
    return response
      .status(400)
      .json({ message: "Choose a valid application status." })
  }

  const application = await Application.findByIdAndUpdate(
    request.params.id,
    { status },
    { new: true },
  )

  if (!application)
    return response.status(404).json({ message: "Application not found." })

  return response.json({ status: application.status })
})

export default router
