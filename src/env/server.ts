import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    SMS_SEND_CLIENT_URL: z.string().url(),
    SMS_USERID: z.string().min(1),
    SMS_ACCOUNT: z.string().min(1),
    SMS_PASSWORD: z.string().min(1),
  },
  runtimeEnv: process.env,
})
