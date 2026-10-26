import dotenv from "dotenv"

import bcrypt from "bcryptjs"

import { fileURLToPath } from "node:url"

import mongoose from "mongoose"

import User from "../models/User.js"

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) })

const companyAccounts = [
  {
    name: "Rahul Sharma",

    email: "rahul.sharma@techdemo.com",

    companyName: "TechDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_1",
  },

  {
    name: "Priya Patel",

    email: "priya.patel@webdemo.com",

    companyName: "WebDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_2",
  },

  {
    name: "Amit Verma",

    email: "amit.verma@codedemo.com",

    companyName: "CodeDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_3",
  },

  {
    name: "Neha Shah",

    email: "neha.shah@innovatedemo.com",

    companyName: "InnovateDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_4",
  },

  {
    name: "Karan Mehta",

    email: "karan.mehta@cloudtechdemo.com",

    companyName: "CloudTechDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_5",
  },

  {
    name: "Anjali Desai",

    email: "anjali.desai@softdemo.com",

    companyName: "SoftDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_6",
  },

  {
    name: "Vishal Joshi",

    email: "vishal.joshi@devdemo.com",

    companyName: "DevDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_7",
  },

  {
    name: "Sneha Gupta",

    email: "sneha.gupta@digitaldemo.com",

    companyName: "DigitalDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_8",
  },

  {
    name: "Arjun Singh",

    email: "arjun.singh@startupdemo.com",

    companyName: "StartupDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_9",
  },

  {
    name: "Pooja Trivedi",

    email: "pooja.trivedi@nextdemo.com",

    companyName: "NextDemo",

    passwordVariable: "COMPANY_SEED_PASSWORD_10",
  },
]

const passwords = new Map(
  companyAccounts.map(({ passwordVariable }) => [
    passwordVariable,

    process.env[passwordVariable],
  ]),
)

const missingPasswords = [...passwords]

  .filter(([, password]) => !password)

  .map(([passwordVariable]) => passwordVariable)

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required. Set it in backend/.env.")

  process.exitCode = 1
} else if (missingPasswords.length > 0) {
  console.error(
    `Set the following password variables in backend/.env: ${missingPasswords.join(", ")}.`,
  )

  process.exitCode = 1
} else if (
  [...passwords.values()].some(
    (password) =>
      Buffer.byteLength(password, "utf8") > 72 || password.length < 8,
  )
) {
  console.error("Company seed passwords must be between 8 and 72 bytes.")

  process.exitCode = 1
} else {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    const existingUsers = await User.find({
      email: { $in: companyAccounts.map(({ email }) => email) },
    })

      .select("email")

      .lean()

    const existingEmails = new Set(existingUsers.map(({ email }) => email))

    const newAccounts = companyAccounts.filter(
      ({ email }) => !existingEmails.has(email),
    )

    const operations = await Promise.all(
      newAccounts.map(async (account) => ({
        updateOne: {
          filter: { email: account.email },

          update: {
            $setOnInsert: {
              name: account.name,

              email: account.email,

              passwordHash: await bcrypt.hash(
                passwords.get(account.passwordVariable),

                12,
              ),

              role: "company",

              status: "active",

              companyProfile: {
                companyName: account.companyName,

                contactEmail: account.email,

                verificationStatus: "pending",
              },
            },
          },

          upsert: true,
        },
      })),
    )

    const result =
      operations.length > 0
        ? await User.bulkWrite(operations, { ordered: true })
        : { upsertedCount: 0 }

    const created = result.upsertedCount

    const skipped = companyAccounts.length - created

    console.log(
      `Company seed complete: ${created} created, ${skipped} skipped.`,
    )
  } catch (error) {
    console.error(
      "Company seeding failed. Verify MongoDB connectivity and the User schema.",

      error?.name ?? "Error",

      error?.code ? `(${error.code})` : "",
    )

    process.exitCode = 1
  } finally {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect()
      } catch {
        console.error("Failed to close the MongoDB connection.")

        process.exitCode = 1
      }
    }
  }
}
