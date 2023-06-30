import { FastifyReply, FastifyRequest } from 'fastify'
import { verifyToken } from '../util/auth'
import { authorizationSchema } from '../schemas/user'
import { fromZodError } from 'zod-validation-error'

export async function checkUserLogged(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authorization =
    request.headers.authorization !== undefined
      ? request.headers?.authorization.replace('Bearer ', '')
      : ''

  const _retorno = authorizationSchema.safeParse({ authorization })

  if (!_retorno.success) {
    return reply
      .code(400)
      .header('Content-Type', 'application/json')
      .send({
        statusCode: 400,
        message: fromZodError(_retorno.error),
      })
  } else {
    const retorno = verifyToken(_retorno.data.authorization)

    if (!retorno) {
      reply.code(419).header('Content-Type', 'application/json').send({
        statusCode: 419,
        message: 'Session expired. please sign in again',
      })
    }
  }
}
