import { Router } from "express"

import mongoose from "mongoose"

import { requireAuth, requireRole } from "../middleware/auth.js"

import {
  uploadImage,
  uploadResume,
  validateFileSignature,
} from "../middleware/uploads.js"

import Application from "../models/Application.js"

import Internship from "../models/Internship.js"

import User from "../models/User.js"

import {
  CloudinaryConfigurationError,
  deleteCloudinaryAsset,
  streamPrivateResume,
  uploadToCloudinary,
} from "../services/cloudinary.js"

const router = Router()

function storedFile(file) {
  return {
    url: file.url,

    publicId: file.publicId,

    originalName: file.originalName,

    format: file.format,

    bytes: file.bytes,

    resourceType: file.resourceType,

    accessType: file.accessType,
  }
}

async function cleanUpReplacedFile(oldFile) {
  if (!oldFile) return true

  try {
    await deleteCloudinaryAsset(oldFile)

    return true
  } catch (error) {
    console.error("Cloudinary replacement cleanup failed:", error)

    return false
  }
}

async function deleteStoredFile(file) {
  try {
    await deleteCloudinaryAsset(file)

    return true
  } catch (error) {
    console.error("Cloudinary file deletion failed:", error)

    return false
  }
}

function sendUploadError(error, response) {
  if (error?.name === "UploadValidationError") {
    response.status(400).json({ message: error.message })

    return true
  }

  return false
}

async function handleImageUpload(request, response, getCurrent, setCurrent) {
  if (!request.file) {
    return response.status(400).json({ message: "Choose an image to upload." })
  }

  try {
    validateFileSignature(request.file, "image")
  } catch (error) {
    if (sendUploadError(error, response)) return

    throw error
  }

  let uploaded

  try {
    uploaded = await uploadToCloudinary(request.file, {
      folder: `careerbridge/${request.auth.role.toLowerCase()}`,

      resourceType: "image",

      accessType: "upload",
    })

    const oldFile = getCurrent()

    setCurrent(storedFile(uploaded))

    try {
      await request.user.save()
    } catch (error) {
      await deleteCloudinaryAsset(uploaded)

      throw error
    }

    const cleanupSucceeded = await cleanUpReplacedFile(oldFile)

    return response.json({
      file: storedFile(uploaded),

      cleanupWarning: !cleanupSucceeded,
    })
  } catch (error) {
    console.error("Cloudinary image upload failed:", error)

    return response

      .status(error instanceof CloudinaryConfigurationError ? 503 : 502)

      .json({
        message:
          error instanceof CloudinaryConfigurationError
            ? error.message
            : "The image could not be uploaded. Please try again.",
      })
  }
}

async function handleResumeUpload(request, response) {
  if (!request.file) {
    return response
      .status(400)
      .json({ message: "Choose a PDF resume to upload." })
  }

  try {
    validateFileSignature(request.file, "resume")
  } catch (error) {
    if (sendUploadError(error, response)) return

    throw error
  }

  let uploaded

  try {
    uploaded = await uploadToCloudinary(request.file, {
      folder: "careerbridge/private-resumes",

      resourceType: "raw",

      accessType: "authenticated",

      format: "pdf",
    })

    const oldFile = request.user.studentProfile?.resume

    request.user.studentProfile ??= {}

    request.user.studentProfile.resume = storedFile(uploaded)

    try {
      await request.user.save()
    } catch (error) {
      await deleteCloudinaryAsset(uploaded)

      throw error
    }

    const cleanupSucceeded = await cleanUpReplacedFile(oldFile)

    return response.json({
      resume: { originalName: uploaded.originalName, bytes: uploaded.bytes },

      cleanupWarning: !cleanupSucceeded,
    })
  } catch (error) {
    console.error("Private resume upload failed:", error)

    return response

      .status(error instanceof CloudinaryConfigurationError ? 503 : 502)

      .json({
        message:
          error instanceof CloudinaryConfigurationError
            ? error.message
            : "The resume could not be uploaded. Please try again.",
      })
  }
}

async function handleResumeDownload(file, response) {
  await streamPrivateResume(file, response)
}

router.post(
  "/profile-image",

  requireAuth,

  requireRole("student"),

  uploadImage,

  async (request, response) =>
    handleImageUpload(
      request,

      response,

      () => request.user.studentProfile?.profileImage,

      (file) => {
        request.user.studentProfile ??= {}

        request.user.studentProfile.profileImage = file
      },
    ),
)

router.delete(
  "/profile-image",

  requireAuth,

  requireRole("student"),

  async (request, response) => {
    const file = request.user.studentProfile?.profileImage

    if (!file)
      return response.status(404).json({ message: "No profile image exists." })

    request.user.studentProfile.profileImage = undefined

    await request.user.save()

    const cleanupSucceeded = await deleteStoredFile(file)
    return response.json({
      message: "Profile image deleted.",
      cleanupWarning: !cleanupSucceeded,
    })
  },
)

router.get(
  "/resume",

  requireAuth,

  requireRole("student"),

  (request, response) => {
    const file = request.user.studentProfile?.resume

    return response.json({
      resume: file
        ? { originalName: file.originalName, bytes: file.bytes }
        : null,
    })
  },
)

router.post(
  "/resume",

  requireAuth,

  requireRole("student"),

  uploadResume,

  handleResumeUpload,
)

router.delete(
  "/resume",

  requireAuth,

  requireRole("student"),

  async (request, response) => {
    const file = request.user.studentProfile?.resume

    if (!file)
      return response.status(404).json({ message: "No resume exists." })

    request.user.studentProfile.resume = undefined

    await request.user.save()

    const cleanupSucceeded = await deleteStoredFile(file)
    return response.json({
      message: "Resume deleted.",
      cleanupWarning: !cleanupSucceeded,
    })
  },
)

router.get(
  "/resume/file",

  requireAuth,

  requireRole("student"),

  async (request, response) => {
    const file = request.user.studentProfile?.resume

    if (!file)
      return response.status(404).json({ message: "No resume exists." })

    try {
      await handleResumeDownload(file, response)
    } catch (error) {
      console.error("Private resume download failed:", error)

      if (!response.headersSent) {
        response
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

router.get(
  "/resumes/:studentId/file",

  requireAuth,

  requireRole("company", "admin"),

  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.studentId)) {
      return response.status(404).json({ message: "Resume not found." })
    }

    const student = await User.findOne({
      _id: request.params.studentId,

      role: "student",

      status: "active",
    })

    const file = student?.studentProfile?.resume

    if (!file)
      return response.status(404).json({ message: "Resume not found." })

    if (request.auth.role === "company") {
      const applications = await Application.find({
        student: student._id,
        status: { $ne: "rejected" },
      }).select("internship")

      const internshipIds = applications.map(
        (application) => application.internship,
      )

      const authorizedApplication = await Internship.exists({
        _id: { $in: internshipIds },

        company: request.auth.sub,
      })

      if (!authorizedApplication) {
        return response
          .status(403)
          .json({ message: "You cannot access this resume." })
      }
    }

    try {
      await handleResumeDownload(file, response)
    } catch (error) {
      console.error("Private applicant resume download failed:", error)

      if (!response.headersSent) {
        response
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

router.post(
  "/company-logo",

  requireAuth,

  requireRole("company"),

  uploadImage,

  async (request, response) =>
    handleImageUpload(
      request,

      response,

      () => request.user.companyProfile?.logo,

      (file) => {
        request.user.companyProfile ??= {}

        request.user.companyProfile.logo = file
      },
    ),
)

router.delete(
  "/company-logo",

  requireAuth,

  requireRole("company"),

  async (request, response) => {
    const file = request.user.companyProfile?.logo

    if (!file)
      return response.status(404).json({ message: "No company logo exists." })

    request.user.companyProfile.logo = undefined

    await request.user.save()

    const cleanupSucceeded = await deleteStoredFile(file)
    return response.json({
      message: "Company logo deleted.",
      cleanupWarning: !cleanupSucceeded,
    })
  },
)

router.post(
  "/projects/:projectId/image",

  requireAuth,

  requireRole("student"),

  uploadImage,

  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.projectId)) {
      return response.status(404).json({ message: "Project not found." })
    }

    const project = request.user.studentProfile?.projects.id(
      request.params.projectId,
    )

    if (!project)
      return response.status(404).json({ message: "Project not found." })

    return handleImageUpload(
      request,

      response,

      () => project.image,

      (file) => {
        project.image = file
      },
    )
  },
)

router.delete(
  "/projects/:projectId/image",

  requireAuth,

  requireRole("student"),

  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.projectId)) {
      return response.status(404).json({ message: "Project not found." })
    }

    const project = request.user.studentProfile?.projects.id(
      request.params.projectId,
    )

    if (!project)
      return response.status(404).json({ message: "Project not found." })

    if (!project.image)
      return response.status(404).json({ message: "No project image exists." })

    const image = project.image

    project.image = undefined

    await request.user.save()

    const cleanupSucceeded = await deleteStoredFile(image)
    return response.json({
      message: "Project image deleted.",
      cleanupWarning: !cleanupSucceeded,
    })
  },
)

export default router
