import nodemailer from "nodemailer"

function getSmtpConfig() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT)
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD
  const from = process.env.MAIL_FROM

  if (
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !user ||
    !password ||
    !from
  ) {
    return null
  }

  return { host, port, user, password, from }
}

export function isEmailConfigured() {
  return Boolean(getSmtpConfig())
}

export async function sendPasswordResetEmail(email, name, otp) {
  const config = getSmtpConfig()

  if (!config) {
    throw new Error("SMTP email settings are incomplete.")
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
  })

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Your CareerBridge password reset code",
    text: [
      `Hello ${name},`,
      "",
      "We received a request to reset your CareerBridge password.",
      `Enter this verification code to continue: ${otp}`,
      "This code expires in 10 minutes and can only be used once.",
      "",
      "If you did not request this change, you can ignore this email.",
    ].join("\n"),
  })
}
