import multer from "multer"

const maxFileSize = 5 * 1024 * 1024

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"])

export class UploadValidationError extends Error {
  constructor(message) {
    super(message)

    this.name = "UploadValidationError"
  }
}

function createUpload(allowedTypes, typeLabel) {
  return multer({
    storage: multer.memoryStorage(),

    limits: { fileSize: maxFileSize, files: 1 },

    fileFilter(_request, file, callback) {
      if (!allowedTypes.has(file.mimetype)) {
        callback(
          new UploadValidationError(
            `Choose a valid ${typeLabel} file under 5 MB.`,
          ),
        )

        return
      }

      callback(null, true)
    },
  }).single("file")
}

export const uploadImage = createUpload(imageTypes, "JPEG, PNG, or WebP image")

export const uploadResume = createUpload(
  new Set(["application/pdf"]),

  "PDF resume",
)

export function validateFileSignature(file, kind) {
  const buffer = file?.buffer

  if (!buffer) throw new UploadValidationError("Choose a file to upload.")

  if (kind === "image") {
    const isJpeg =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff

    const isPng =
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))

    const isWebp =
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"

    if (isJpeg || isPng || isWebp) return

    throw new UploadValidationError(
      "The selected file is not a supported JPEG, PNG, or WebP image.",
    )
  }

  if (kind === "resume" && buffer.toString("ascii", 0, 5) !== "%PDF-") {
    throw new UploadValidationError("The selected file is not a valid PDF.")
  }
}
