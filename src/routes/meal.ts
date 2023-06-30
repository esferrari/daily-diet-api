import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { verifyToken } from '../util/auth'

import {
  createMealSchema,
  alterMealSchema,
  getSchema,
  deleteOrGetSchema,
} from '../schemas/meal'
import { checkUserLogged } from '../middleware/check-logged-user'
import { fromZodError } from 'zod-validation-error'

export async function mealRoutes(app: FastifyInstance) {
  app.post(
    '/create',
    {
      preHandler: checkUserLogged,
    },
    async (request, reply) => {
      const _body = createMealSchema.safeParse(request.body)

      if (_body.success === false) {
        return reply
          .code(400)
          .header('Content-Type', 'application/json')
          .send({
            code: 400,
            message: fromZodError(_body.error),
          })
      } else {
        const { name, description, ondiet, meal_at: mealAt } = _body.data
        const token =
          request.headers.authorization !== undefined
            ? request.headers?.authorization.replace('Bearer ', '')
            : ''

        const userDate = verifyToken(token)

        const mealCreated = await knex('meal')
          .insert({
            name,
            description,
            id_user: userDate.id,
            ondiet,
            meal_at: mealAt,
          })
          .returning('*')

        return reply.code(201).header('Content-Type', 'application/json').send({
          statusCode: 201,
          data: mealCreated,
        })
      }
    },
  )

  app.put(
    '/alter',
    {
      preHandler: checkUserLogged,
    },
    async (request, reply) => {
      const _body = alterMealSchema.safeParse(request.body)

      if (_body.success === false) {
        reply
          .code(400)
          .header('Content-Type', 'application/json')
          .send({
            code: 400,
            message: fromZodError(_body.error),
          })
      } else {
        const alterMealObject = _body.data

        const mealDate = await knex('meal')
          .where('id', '=', alterMealObject.id)
          .update({
            name: alterMealObject.name,
            description: alterMealObject.description,
            ondiet: alterMealObject.ondiet,
            meal_at: alterMealObject.meal_at,
          })
          .returning('*')

        reply.code(200).header('Content-Type', 'application/json').send({
          statusCode: 200,
          data: mealDate,
        })
      }
    },
  )

  app.delete(
    '/delete/:id',
    {
      preHandler: checkUserLogged,
    },
    async (request: FastifyRequest, reply) => {
      try {
        const { id } = request.params

        const idAsNumber = parseInt(id, 10)

        const _params = deleteOrGetSchema.safeParse({ id: idAsNumber })

        if (_params.success === false) {
          return reply
            .code(400)
            .header('Content-Type', 'application/json')
            .send({
              statusCode: 400,
              message: fromZodError(_params.error),
            })
        } else {
          const { id: idMeal } = _params.data

          let id: string | undefined
          if (typeof request.headers.authorization === 'string') {
            const dataClient = verifyToken(request.headers.authorization)
            id = dataClient.id
          }

          const mealDeleted: any = await knex('meal')
            .where('id', idMeal)
            .andWhere('id_user', id)
            .del()
            .returning('*')

          const result = {
            statusCode: mealDeleted === 1 ? 200 : 401,
            message: mealDeleted === 1 ? 'Successfully' : 'Unauthorized',
          }

          return reply
            .code(200)
            .header('Content-Type', 'application/json')
            .send({
              statusCode: result.statusCode,
              message: result.message,
            })
        }
      } catch (error: any) {
        return reply.code(500).header('Content-Type', 'application/json').send({
          statusCode: 500,
          message: error.message,
        })
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: checkUserLogged,
    },
    async (request, reply) => {
      const _params = getSchema.safeParse(request.params)

      if (_params.success === false) {
        reply
          .code(400)
          .header('Content-Type', 'application/json')
          .send({
            code: 400,
            message: fromZodError(_params.error),
          })
      } else {
        const { id } = _params.data

        const mealDeleted = await knex('meal').where('id_user', id)

        reply.code(200).header('Content-Type', 'application/json').send({
          statusCode: 200,
          data: mealDeleted,
        })
      }
    },
  )

  app.get(
    '/meal/:id',
    {
      preHandler: checkUserLogged,
    },
    async (request, reply) => {
      const _params = deleteOrGetSchema.safeParse(request.params)

      if (_params.success === false) {
        reply
          .code(400)
          .header('Content-Type', 'application/json')
          .send({
            code: 400,
            message: fromZodError(_params.error),
          })
      } else {
        const { id } = _params.data
        const mealSelected = await knex('meal').where('id_user', id)

        reply.code(200).header('Content-Type', 'application/json').send({
          statusCode: 200,
          data: mealSelected,
        })
      }
    },
  )

  app.get('/metric/:id', async (request, reply) => {
    const _params = getSchema.safeParse(request.params)

    if (_params.success === false) {
      reply
        .code(400)
        .header('Content-Type', 'application/json')
        .send({
          statusCode: 400,
          message: fromZodError(_params.error),
        })
    } else {
      const { id } = _params.data

      // Quantidade total de refeições registradas
      const totalMeals = await knex('meal')
        .count('* as total')
        .where('id_user', id)

      // Quantidade total de refeições dentro da dieta
      const totalMealsOnDiet = await knex('meal')
        .count('* as total')
        .where('ondiet', true)
        .andWhere('id_user', id)

      // Quantidade total de refeições fora da dieta
      const totalMealsOffDiet = await knex('meal')
        .count('* as total')
        .where('ondiet', false)
        .andWhere('id_user', id)

      const query = `
        select name from (
            SELECT name, count(name) as total FROM
            meal where ondiet = True
            and id_user = ?
            group by name
        ) order by total desc
        limit 1
        `
      // - Melhor sequência de refeições dentro da dieta
      const bestsequenceOndiet = await knex.raw(query, [id])

      return reply
        .code(200)
        .header('Content-Type', 'application/json')
        .send({
          statusCode: 200,
          data: {
            totalmeals: totalMeals.length > 0 ? totalMeals[0].total : 0,
            totalmealsondiet:
              totalMealsOnDiet.length > 0 ? totalMealsOnDiet[0].total : 0,
            totalmealsoffdiet:
              totalMealsOffDiet.length > 0 ? totalMealsOffDiet[0].total : 0,
            bestsequenceOndiet:
              bestsequenceOndiet.length > 0 ? bestsequenceOndiet[0].name : '',
          },
        })
    }
  })
}
