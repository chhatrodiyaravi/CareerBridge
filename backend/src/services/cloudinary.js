import { v2 as cloudinary } from "cloudinary"

import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"

export class CloudinaryConfigurationError extends Error {
  constructor(message) {
    super(message)

    this.name = "CloudinaryConfigurationError"
  }
}

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new CloudinaryConfigurationError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    )
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET,

    secure: true,
  })

  return cloudinary
}

export async function uploadToCloudinary(file, options) {
  const client = configureCloudinary()

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: options.folder,

        resource_type: options.resourceType,

        type: options.accessType,

        ...(options.format ? { format: options.format } : {}),
      },

      (error, result) => {
        if (error) {
          reject(error)

          return
        }

        if (!result) {
          reject(new Error("Cloudinary did not return an uploaded asset."))

          return
        }

        resolve({
          url: result.secure_url,

          publicId: result.public_id,

          originalName: file.originalname.slice(0, 255),

          format: result.format || options.format || "unknown",

          bytes: result.bytes,

          resourceType: options.resourceType,

          accessType: options.accessType,
        })
      },
    )

    Readable.from([file.buffer]).pipe(stream)
  })
}

export async function deleteCloudinaryAsset(file) {
  if (!file?.publicId) return

  const client = configureCloudinary()

  const result = await client.uploader.destroy(file.publicId, {
    resource_type: file.resourceType,

    type: file.accessType,

    invalidate: true,
  })

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary deletion failed: ${result.result}.`)
  }
}

export function privateDownloadUrl(file) {
  const client = configureCloudinary()

  return client.utils.private_download_url(file.publicId, file.format, {
    resource_type: "raw",

    type: "authenticated",

    attachment: false,

    expires_at: Math.floor(Date.now() / 1000) + 60,
  })
}

export async function streamPrivateResume(file, response) {
  const remoteResponse = await fetch(privateDownloadUrl(file))
  if (!remoteResponse.ok || !remoteResponse.body) {
    throw new Error(
      `Cloudinary resume download failed with status ${remoteResponse.status}.`,
    )
  }

  response.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.originalName || "resume.pdf")}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  })
  await pipeline(remoteResponse.body, response)
}
