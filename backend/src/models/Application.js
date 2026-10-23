import mongoose from "mongoose"

const { Schema, model, models } = mongoose

const applicationSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    internship: {
      type: Schema.Types.ObjectId,

      ref: "Internship",

      required: true,
    },

    status: {
      type: String,

      enum: ["applied", "reviewed", "shortlisted", "rejected", "selected"],

      default: "applied",
    },

    coverLetter: { type: String, trim: true, maxlength: 5000 },

    resumeUrl: { type: String, trim: true, maxlength: 2048 },
  },

  { timestamps: true },
)

applicationSchema.index({ student: 1, createdAt: -1 })

applicationSchema.index({ internship: 1, status: 1, createdAt: -1 })

applicationSchema.index({ student: 1, internship: 1 }, { unique: true })

export default models.Application || model("Application", applicationSchema)
