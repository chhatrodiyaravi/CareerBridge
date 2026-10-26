import mongoose from "mongoose"

const { Schema, model, models } = mongoose

const uploadedFileSchema = new Schema(
  {
    url: { type: String, required: true, maxlength: 2048 },
    publicId: { type: String, required: true, maxlength: 255 },
    originalName: { type: String, required: true, maxlength: 255 },
    format: { type: String, required: true, maxlength: 20 },
    bytes: { type: Number, required: true, min: 0 },
    resourceType: { type: String, required: true, enum: ["image", "raw"] },
    accessType: {
      type: String,
      required: true,
      enum: ["upload", "authenticated"],
    },
  },
  { _id: false },
)

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    technologies: [{ type: String, trim: true, maxlength: 80 }],
    githubUrl: { type: String, trim: true, maxlength: 2048 },
    demoUrl: { type: String, trim: true, maxlength: 2048 },
    image: { type: uploadedFileSchema, default: undefined },
  },
  { timestamps: true },
)

const studentProfileSchema = new Schema(
  {
    phone: { type: String, trim: true },

    location: { type: String, trim: true },

    profileImage: { type: uploadedFileSchema, default: undefined },

    resume: { type: uploadedFileSchema, default: undefined },

    education: {
      degree: { type: String, trim: true },

      college: { type: String, trim: true },

      university: { type: String, trim: true },

      graduationYear: { type: Number, min: 1900, max: 2200 },
    },

    skills: [{ type: String, trim: true }],

    projects: [projectSchema],
  },

  { _id: false },
)

const companyProfileSchema = new Schema(
  {
    companyName: { type: String, trim: true },

    industry: { type: String, trim: true },

    website: { type: String, trim: true },

    location: { type: String, trim: true },

    companySize: { type: String, trim: true },

    contactEmail: { type: String, lowercase: true, trim: true },

    phone: { type: String, trim: true },

    description: { type: String, trim: true },

    logo: { type: uploadedFileSchema, default: undefined },

    verificationStatus: {
      type: String,

      enum: ["pending", "verified", "rejected"],

      default: "pending",
    },
  },

  { _id: false },
)

const settingsSchema = new Schema(
  {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    profileVisibility: { type: Boolean, default: true },
    applicationReminders: { type: Boolean, default: true },
  },
  { _id: false },
)

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },

    email: {
      type: String,

      required: true,

      unique: true,

      lowercase: true,

      trim: true,

      maxlength: 254,
    },

    passwordHash: { type: String, required: true, select: false },

    passwordResetOtpHash: { type: String, select: false },

    passwordResetOtpExpires: { type: Date, select: false },

    passwordResetOtpAttempts: { type: Number, default: 0, select: false },

    role: {
      type: String,

      required: true,

      enum: ["student", "company", "admin"],
    },

    status: {
      type: String,

      enum: ["active", "inactive"],

      default: "active",
    },

    studentProfile: {
      type: studentProfileSchema,

      default: undefined,
    },

    companyProfile: {
      type: companyProfileSchema,

      default: undefined,
    },

    settings: {
      type: settingsSchema,

      default: () => ({}),
    },
  },

  { timestamps: true },
)

userSchema.index({ role: 1, createdAt: -1 })

export default models.User || model("User", userSchema)
