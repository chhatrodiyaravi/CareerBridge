import { Router } from "express"

import mongoose from "mongoose"

import { requireAuth, requireRole } from "../middleware/auth.js"

import { uploadResume, validateFileSignature } from "../middleware/uploads.js"

import Application from "../models/Application.js"

import Internship from "../models/Internship.js"

import {
  CloudinaryConfigurationError,
  deleteCloudinaryAsset,
  streamPrivateResume,
  uploadToCloudinary,
} from "../services/cloudinary.js"

const router = Router()

const companyStatuses = ["reviewed", "shortlisted", "rejected", "selected"]

router.post(
  "/internships/:internshipId/applications",
  requireAuth,
  requireRole("student"),
  uploadResume,
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.internshipId)) {
      return response.status(404).json({ message: "Internship not found." })
    }

    const internship = await Internship.findOne({
      _id: request.params.internshipId,
      status: "published",
    })

    if (!internship)
      return response.status(404).json({ message: "Internship not found." })

    if (internship.deadline && internship.deadline.getTime() < Date.now()) {
      return response
        .status(400)
        .json({ message: "The application deadline has passed." })
    }

    const coverLetter =
      typeof request.body?.coverLetter === "string"
        ? request.body.coverLetter.trim()
        : ""

    const resumeUrl =
      typeof request.body?.resumeUrl === "string"
        ? request.body.resumeUrl.trim()
        : ""

    if (coverLetter.length > 5000)
      return response
        .status(400)
        .json({ message: "Cover letter must be 5000 characters or fewer." })

    if (
      resumeUrl &&
      (resumeUrl.length > 2048 || !/^https?:\/\//i.test(resumeUrl))
    ) {
      return response.status(400).json({ message: "Enter a valid resume URL." })
    }

    if (request.file) {
      try {
        validateFileSignature(request.file, "resume")
      } catch (error) {
        return response.status(400).json({ message: error.message })
      }
    }

    const existing = await Application.exists({
      student: request.auth.sub,
      internship: internship.id,
    })

    if (existing)
      return response
        .status(409)
        .json({ message: "You have already applied to this internship." })

    let uploadedResume
    try {
      if (request.file) {
        uploadedResume = await uploadToCloudinary(request.file, {
          folder: "careerbridge/private-resumes/applications",
          resourceType: "raw",
          accessType: "authenticated",
          format: "pdf",
        })
      }

      const application = await Application.create({
        student: request.auth.sub,
        internship: internship.id,
        coverLetter,
        ...(!uploadedResume ? { resumeUrl } : {}),
        ...(uploadedResume
          ? {
              resumeFile: {
                url: uploadedResume.url,
                publicId: uploadedResume.publicId,
                originalName: uploadedResume.originalName,
                format: uploadedResume.format,
                bytes: uploadedResume.bytes,
                resourceType: uploadedResume.resourceType,
                accessType: uploadedResume.accessType,
              },
            }
          : {}),
      })

      return response.status(201).json({
        application: { id: application.id, status: application.status },
      })
    } catch (error) {
      if (uploadedResume) {
        try {
          await deleteCloudinaryAsset(uploadedResume)
        } catch (cleanupError) {
          console.error(
            "Failed to clean up resume after application submission failed:",
            cleanupError,
          )
        }
      }
      if (error?.code === 11000) {
        return response
          .status(409)
          .json({ message: "You have already applied to this internship." })
      }
      if (error instanceof CloudinaryConfigurationError) {
        return response.status(503).json({ message: error.message })
      }
      if (request.file && !uploadedResume) {
        console.error("Application resume upload failed:", error)
        return response.status(502).json({
          message: "The resume could not be uploaded. Please try again.",
        })
      }
      if (request.file) {
        console.error(
          "Application submission failed after resume upload:",
          error,
        )
        return response.status(500).json({
          message: "The application could not be submitted. Please try again.",
        })
      }
      throw error
    }
  },
)

router.get(
  "/applications/mine",
  requireAuth,
  requireRole("student"),
  async (request, response) => {
    const skills = new Set(
      (request.user.studentProfile?.skills ?? []).map((skill) =>
        skill.toLowerCase(),
      ),
    )

    const applications = await Application.find({ student: request.auth.sub })

      .sort({ createdAt: -1 })

      .populate({
        path: "internship",

        select: "title company location mode requiredSkills",

        populate: {
          path: "company",
          select: "name companyProfile.companyName companyProfile.logo.url",
        },
      })

      .lean()

    return response.json({
      applications: applications.map((application) => ({
        id: application._id.toString(),

        internshipId: application.internship?._id?.toString(),

        company:
          application.internship?.company?.companyProfile?.companyName ||
          application.internship?.company?.name ||
          "Company",

        internship:
          application.internship?.title || "Internship no longer available",

        date: application.createdAt,

        status: application.status,

        match: application.internship?.requiredSkills?.length
          ? Math.round(
              (application.internship.requiredSkills.filter((skill) =>
                skills.has(skill.toLowerCase()),
              ).length /
                application.internship.requiredSkills.length) *
                100,
            )
          : 0,
      })),
    })
  },
)

router.get(
  "/company/applications",
  requireAuth,
  requireRole("company"),
  async (request, response) => {
    const internshipFilter = { company: request.auth.sub }

    if (request.query.internship) {
      if (!mongoose.isValidObjectId(request.query.internship))
        return response
          .status(400)
          .json({ message: "Choose a valid internship." })

      internshipFilter._id = request.query.internship
    }

    const internships = await Internship.find(internshipFilter).select("_id")

    const applications = await Application.find({
      internship: { $in: internships.map((internship) => internship._id) },
    })

      .sort({ createdAt: -1 })

      .populate({
        path: "student",

        select: "name email studentProfile",
      })

      .populate({ path: "internship", select: "title requiredSkills" })

      .lean()

    return response.json({
      applications: applications.map((application) => ({
        id: application._id.toString(),

        status: application.status,

        date: application.createdAt,

        coverLetter: application.coverLetter ?? "",

        resumeUrl: application.resumeFile
          ? `/api/applications/${application._id.toString()}/resume`
          : application.student?.studentProfile?.resume
            ? `/api/uploads/resumes/${application.student._id.toString()}/file`
            : (application.resumeUrl ?? ""),

        student: {
          id: application.student?._id?.toString(),

          name: application.student?.name ?? "Student",

          email: application.student?.email ?? "",

          skills: application.student?.studentProfile?.skills ?? [],

          education: application.student?.studentProfile?.education ?? {},
        },

        internship: {
          id: application.internship?._id?.toString(),

          title: application.internship?.title ?? "Internship",

          requiredSkills: application.internship?.requiredSkills ?? [],
        },
      })),
    })
  },
)

router.get(
  "/applications/:id/resume",
  requireAuth,
  requireRole("student", "company"),
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(404).json({ message: "Resume not found." })
    }

    const application = await Application.findById(request.params.id).populate(
      "internship",
      "company",
    )
    if (!application?.resumeFile) {
      return response.status(404).json({ message: "Resume not found." })
    }

    const isStudentOwner =
      request.auth.role === "student" &&
      application.student.toString() === request.auth.sub
    const isHiringCompany =
      request.auth.role === "company" &&
      application.internship?.company?.toString() === request.auth.sub

    if (!isStudentOwner && !isHiringCompany) {
      return response
        .status(403)
        .json({ message: "You cannot access this resume." })
    }

    try {
      await streamPrivateResume(application.resumeFile, response)
    } catch (error) {
      console.error("Application resume download failed:", error)
      if (!response.headersSent) {
        return response
          .status(error instanceof CloudinaryConfigurationError ? 503 : 502)
          .json({
            message:
              error instanceof CloudinaryConfigurationError
                ? error.message
                : "The resume could not be opened.",
          })
      }
    }
  },
)

router.patch(
  "/company/applications/:id/status",
  requireAuth,
  requireRole("company"),
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(404).json({ message: "Application not found." })
    }

    const { status } = request.body ?? {}

    if (!companyStatuses.includes(status)) {
      return response
        .status(400)
        .json({ message: "Choose a valid application status." })
    }

    const application = await Application.findById(request.params.id).populate({
      path: "internship",

      select: "company",
    })

    if (
      !application ||
      application.internship.company.toString() !== request.auth.sub
    ) {
      return response.status(404).json({ message: "Application not found." })
    }

    application.status = status

    await application.save()

    return response.json({
      application: { id: application.id, status: application.status },
    })
  },
)

export default router
