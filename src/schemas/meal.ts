import { z } from 'zod'

export const createMealSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  ondiet: z.boolean(),
  meal_at: z
    .string()
    .datetime({ message: 'Invalid format Datetime (2020-01-01T00:00:00Z)' }),
})

export const alterMealSchema = z.object({
  id: z.number(),
  name: z.optional(z.string()),
  description: z.optional(z.string()),
  ondiet: z.optional(z.boolean()),
  meal_at: z.optional(
    z
      .string()
      .datetime({ message: 'Invalid format Datetime (2020-01-01T00:00:00Z)' }),
  ),
})

export const deleteOrGetSchema = z.object({
  id: z.number(),
})

export const getSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid format ID',
  }),
})
