import { Router } from "express"

import { requireAuth } from "../middleware/auth.js"

const router = Router()

const settingNames = [
  "emailNotifications",
  "smsNotifications",
  "profileVisibility",
  "applicationReminders",
]

router.get("/", requireAuth, (request, response) => {
  return response.json({ settings: request.user.settings })
})

router.put("/", requireAuth, async (request, response) => {
  const settings = request.body?.settings

  if (
    !settings ||
    settingNames.some((name) => typeof settings[name] !== "boolean")
  ) {
    return response
      .status(400)
      .json({
        message:
          "Provide all notification and visibility settings as booleans.",
      })
  }

  request.user.settings = Object.fromEntries(
    settingNames.map((name) => [name, settings[name]]),
  )

  await request.user.save()

  return response.json({ settings: request.user.settings })
})

export default router
