import dotenv from "dotenv"

import bcrypt from "bcryptjs"

import { fileURLToPath } from "node:url"

import mongoose from "mongoose"

import User from "../models/User.js"

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) })

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before provisioning an admin.",
  )

  process.exit(1)
}

if (ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 72) {
  console.error("ADMIN_PASSWORD must be between 12 and 72 characters.")

  process.exit(1)
}

try {
  await mongoose.connect(MONGODB_URI)

  const email = ADMIN_EMAIL.trim().toLowerCase()

  const existingUser = await User.exists({ email })

  if (existingUser) {
    console.error(
      "An account with ADMIN_EMAIL already exists. No changes were made.",
    )

    process.exitCode = 1
  } else {
    await User.create({
      name: ADMIN_NAME.trim(),

      email,

      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),

      role: "admin",
    })

    console.log(`Admin account created for ${email}.`)
  }
} catch {
  console.error(
    "Admin provisioning failed. Verify the database connection and account configuration.",
  )

  process.exitCode = 1
} finally {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}
