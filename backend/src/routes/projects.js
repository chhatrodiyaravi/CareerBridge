import { Router } from "express"

import { requireAuth, requireRole } from "../middleware/auth.js"

const router = Router()

function projectView(project) {
  return { ...project.toObject(), id: project.id }
}

function validateProject(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : ""

  const description =
    typeof body?.description === "string" ? body.description.trim() : ""

  const technologies = body?.technologies ?? []

  const githubUrl =
    typeof body?.githubUrl === "string" ? body.githubUrl.trim() : ""

  const demoUrl = typeof body?.demoUrl === "string" ? body.demoUrl.trim() : ""

  if (!name || name.length > 120)
    return { error: "Project name must be between 1 and 120 characters." }

  if (description.length > 2000)
    return { error: "Project description must be 2000 characters or fewer." }

  if (
    !Array.isArray(technologies) ||
    technologies.some(
      (technology) =>
        typeof technology !== "string" || technology.trim().length > 80,
    )
  ) {
    return {
      error: "Technologies must be a list of names up to 80 characters each.",
    }
  }

  for (const url of [githubUrl, demoUrl]) {
    if (url && (url.length > 2048 || !/^https?:\/\//i.test(url))) {
      return { error: "Project links must be valid HTTP or HTTPS URLs." }
    }
  }

  return {
    values: {
      name,

      description,

      technologies: [
        ...new Set(
          technologies.map((technology) => technology.trim()).filter(Boolean),
        ),
      ],

      githubUrl,

      demoUrl,
    },
  }
}

router.get("/", requireAuth, requireRole("student"), (request, response) => {
  return response.json({
    projects: (request.user.studentProfile?.projects ?? []).map(projectView),
  })
})

router.post(
  "/",
  requireAuth,
  requireRole("student"),
  async (request, response) => {
    const { error, values } = validateProject(request.body)

    if (error) return response.status(400).json({ message: error })

    request.user.studentProfile ??= {}

    request.user.studentProfile.projects.push(values)

    await request.user.save()

    const project = request.user.studentProfile.projects.at(-1)

    return response.status(201).json({ project: projectView(project) })
  },
)

router.patch(
  "/:projectId",
  requireAuth,
  requireRole("student"),
  async (request, response) => {
    const { error, values } = validateProject(request.body)

    if (error) return response.status(400).json({ message: error })

    const project = request.user.studentProfile?.projects.id(
      request.params.projectId,
    )

    if (!project)
      return response.status(404).json({ message: "Project not found." })

    Object.assign(project, values)

    await request.user.save()

    return response.json({ project: projectView(project) })
  },
)

router.delete(
  "/:projectId",
  requireAuth,
  requireRole("student"),
  async (request, response) => {
    const projects = request.user.studentProfile?.projects

    const project = projects?.id(request.params.projectId)

    if (!project)
      return response.status(404).json({ message: "Project not found." })

    project.deleteOne()

    await request.user.save()

    return response.json({ message: "Project deleted." })
  },
)

export default router
