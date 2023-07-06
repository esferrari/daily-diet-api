import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  console.log('caiu aqui teste')
  config({ path: '.env.test' })
} else {
  console.log('caiu aqui')
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
  HASH: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.log('Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables!')
}

export const env = _env.data
