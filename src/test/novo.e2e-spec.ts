import { test, expect, beforeAll } from 'vitest'
import { env } from '../env'

beforeAll(async () => {
  // await app.ready()
  console.log(env.DATABASE_URL)
  console.log(env.NODE_ENV)
  console.log('teste')
  // function generateDatabaseURL(schema: string) {
  //   if (!process.env.DATABASE_URL) {
  //     throw new Error('Please provide a DATABASE_URL environment variable.')
  //   }

  //   const url = new URL(process.env.DATABASE_URL)

  //   url.searchParams.set('schema', schema)

  //   return url.toString()
})

test('should execute', () => {
  expect(1 + 1).toBe(2)
})
