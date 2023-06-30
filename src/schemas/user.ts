import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(1, { message: 'User name is required' }),
  email: z.string().email('Invalid email format address'),
})

export const loginUserSchema = z.object({
  id: z.string().uuid({ message: 'Invalid format ID!' }),
  email: z.string().email('Invalid email format address'),
})

export const authorizationSchema = z.object({
  authorization: z.string().min(2, {
    message: 'Authorization token is required !',
  }),
})
