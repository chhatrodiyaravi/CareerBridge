import dotenv from "dotenv"

import cookieParser from "cookie-parser"

import express from "express"

import { fileURLToPath } from "node:url"

import mongoose from "mongoose"

import applicationRoutes from "./routes/applications.js"

import adminRoutes from "./routes/admin.js"

import authRoutes from "./routes/auth.js"

import internshipRoutes from "./routes/internships.js"

import profileRoutes from "./routes/profile.js"

import projectRoutes from "./routes/projects.js"

import settingsRoutes from "./routes/settings.js"

import uploadRoutes from "./routes/uploads.js"

import multer from "multer"

import { UploadValidationError } from "./middleware/uploads.js"

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) })

const app = express()

const port = Number(process.env.API_PORT || 5000)

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  console.error("MONGODB_URI is required. Set it in the local .env file.")

  process.exit(1)
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "JWT_SECRET must be set to a random value of at least 32 characters.",
  )

  process.exit(1)
}

app.disable("x-powered-by")

app.use(express.json({ limit: "32kb" }))

app.use(cookieParser())

app.get("/api/health/live", (_request, response) => {
  return response.json({ status: "ok" })
})

app.get("/api/health", (_request, response) => {
  const databaseStates = [
    "disconnected",
    "connected",
    "connecting",
    "disconnecting",
  ]
  const database = databaseStates[mongoose.connection.readyState] ?? "unknown"
  const connected = database === "connected"

  return response.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",

    database,
  })
})

app.use("/api/auth", authRoutes)

app.use("/api/admin", adminRoutes)

app.use("/api", applicationRoutes)

app.use("/api/profile", profileRoutes)

app.use("/api/uploads", uploadRoutes)

app.use("/api/projects", projectRoutes)

app.use("/api/settings", settingsRoutes)

app.use("/api/internships", internshipRoutes)

app.use("/api", (_request, response) => {
  response.status(404).json({ message: "API route not found." })
})

app.use((error, _request, response, _next) => {
  console.error("API request failed:", error)

  if (error instanceof UploadValidationError) {
    return response.status(400).json({ message: error.message })
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Files must be 5 MB or smaller."
        : "Choose one valid file to upload."
    return response.status(400).json({ message })
  }

  if (error?.type === "entity.parse.failed") {
    return response
      .status(400)
      .json({ message: "Request body must contain valid JSON." })
  }

  if (error?.code === 11000) {
    return response.status(409).json({ message: "This record already exists." })
  }

  return response
    .status(500)
    .json({ message: "An unexpected server error occurred." })
})

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected; database readiness is unavailable.")
})

mongoose.connection.on("reconnected", () => {
  console.info("MongoDB connection restored.")
})

mongoose.connection.on("error", () => {
  console.error("MongoDB connection error; check database connectivity.")
})

app.listen(port, () => {
  console.log(`CareerBridge API listening on port ${port}`)

  void mongoose
    .connect(mongoUri)
    .then(() => {
      console.info("MongoDB connection established.")
    })
    .catch(() => {
      console.error(
        "Could not connect to MongoDB. Check the Atlas IP access list, database user permissions, and backend/.env settings. Connection details were not logged.",
      )
    })
})
