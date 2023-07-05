import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { createUserSchema, loginUserSchema } from '../schemas/user'
import { generateToken } from '../util/auth'
import { fromZodError } from 'zod-validation-error'
import prisma from '../prisma'

export async function userRoutes(app: FastifyInstance) {
  app.post('/create', async (request, reply) => {
    const _body = createUserSchema.safeParse(request.body)

    if (_body.success === false) {
      reply.code(400).send({
        statusCode: 400,
        message: fromZodError(_body.error),
      })
    } else {
      const { username, email } = _body.data
      //   const userExist = await knex('user').select('id').where('email', email)
      const userExist = await prisma.user.findFirst({
        where: { email },
      })

      if (userExist) {
        return reply.code(409).send({
          statusCode: 409,
          message: 'User already exist !',
        })
      }

      const userCreated = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          username,
          email,
        },
      })

      return reply.code(201).send({
        statusCode: 201,
        data: userCreated,
      })
    }
  })

  app.post('/login', async (request, reply) => {
    const _body = loginUserSchema.safeParse(request.body)

    if (_body.success === false) {
      return reply.code(400).send({
        statusCode: 400,
        message: fromZodError(_body.error),
      })
    } else {
      const { id, email } = _body.data

      const userExist = await prisma.user.findFirst({
        where: { email, id },
      })

      if (!userExist) {
        reply.code(404).send({
          statusCode: 404,
          message: 'User not found !',
        })
      }

      const token = generateToken({ id, email })

      return reply.code(200).send({
        statusCode: 200,
        data: { token },
      })
    }
  })
}
