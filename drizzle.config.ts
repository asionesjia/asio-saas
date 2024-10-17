import type { Config } from 'drizzle-kit'
import { env } from '@/env/server'

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.POSTGRES_URL!,
  },
} satisfies Config
