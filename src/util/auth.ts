import jwt from 'jsonwebtoken'
import { env } from '../env/'
import { loginUserSchema } from '../schemas/user'

export function generateToken(payload: object): string {
  const token = jwt.sign(payload, env.HASH, { expiresIn: '1h' })
  return token
}

export function verifyToken(token: string) {
  const authorization = token !== undefined ? token.replace('Bearer ', '') : ''
  const userDate = loginUserSchema.parse(jwt.verify(authorization, env.HASH))
  return userDate
}
