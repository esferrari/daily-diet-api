import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import crypto from 'node:crypto'
import { createUserSchema, loginUserSchema } from '../schemas/user'
import { generateToken } from '../util/auth'
import { fromZodError } from 'zod-validation-error'

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

      const userExist = await knex('user').select('id').where('email', email)

      if (userExist.length > 0) {
        return reply.code(409).send({
          statusCode: 409,
          message: 'User already exist !',
        })
      }

      const userCreated = await knex('user')
        .insert({
          id: crypto.randomUUID(),
          username,
          email,
        })
        .returning('*')
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

      const userExist = await knex('user')
        .select('id')
        .where('id', id)
        .andWhere('email', email)

      if (userExist.length === 0) {
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
