import mongoose from "mongoose"

const { Schema, model, models } = mongoose

const internshipSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 160 },

    description: { type: String, required: true, trim: true, maxlength: 10000 },

    location: { type: String, trim: true, maxlength: 160 },

    mode: {
      type: String,

      enum: ["Remote", "Hybrid", "On-site"],

      default: "Remote",
    },

    duration: { type: String, trim: true, maxlength: 80 },

    type: {
      type: String,

      enum: ["Full-time", "Part-time", "Contract"],

      default: "Full-time",
    },

    deadline: { type: Date },

    openings: { type: Number, min: 1, default: 1 },

    stipend: { type: String, trim: true, maxlength: 80 },

    requiredSkills: [{ type: String, trim: true, maxlength: 80 }],

    status: {
      type: String,

      enum: ["draft", "published", "closed"],

      default: "draft",
    },

    publishedAt: { type: Date },
  },

  { timestamps: true },
)

internshipSchema.index({ status: 1, createdAt: -1 })

internshipSchema.index({ company: 1, status: 1, createdAt: -1 })

export default models.Internship || model("Internship", internshipSchema)
