import { FastifyInstance, FastifyRequest } from 'fastify'
import { verifyToken } from '../util/auth'

import {
  createMealSchema,
  alterMealSchema,
  getSchema,
  deleteOrGetSchema,
} from '../schemas/meal'
import { checkUserLogged } from '../middleware/check-logged-user'
import { fromZodError } from 'zod-validation-error'
import prisma from '../prisma'

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

        const mealCreated = await prisma.meal.create({
          data: {
            name,
            description,
            id_user: userDate.id,
            ondiet,
            meal_at: mealAt,
          },
        })

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

        const mealDate = await prisma.meal.update({
          where: { id: alterMealObject.id },
          data: {
            name: alterMealObject.name,
            description: alterMealObject.description,
            ondiet: alterMealObject.ondiet,
            meal_at: alterMealObject.meal_at,
          },
        })

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
        const { id }: any = request.params

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

          let idUser: string | undefined
          if (typeof request.headers.authorization === 'string') {
            const dataClient = verifyToken(request.headers.authorization)
            idUser = dataClient.id
          }

          const mealDeleted: { count: number } = await prisma.meal.deleteMany({
            where: {
              AND: [
                {
                  id_user: {
                    equals: idUser,
                  },
                },
                {
                  id: {
                    equals: idMeal,
                  },
                },
              ],
            },
          })

          const result = {
            statusCode: 200,
            message: `Deleted ${mealDeleted.count} records`,
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
    '/list',
    {
      preHandler: checkUserLogged,
    },
    async (request, reply) => {
      const token =
        request.headers.authorization !== undefined
          ? request.headers?.authorization.replace('Bearer ', '')
          : ''

      const { id: idUser } = verifyToken(token)

      const mealsSelected = await prisma.meal.findMany({
        where: {
          id_user: idUser,
        },
      })

      reply.code(200).header('Content-Type', 'application/json').send({
        statusCode: 200,
        data: mealsSelected,
      })
    },
  )

  app.get('/:id', async (request, reply) => {
    try {
      const { id }: any = request.params

      const idAsNumber = parseInt(id, 10)

      const _params = deleteOrGetSchema.safeParse({ id: idAsNumber })

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
        const mealSelected: any = await prisma.meal.findUnique({
          where: {
            id,
          },
        })

        const result = {
          statusCode: mealSelected === null ? 404 : 200,
          data: mealSelected === null ? {} : mealSelected,
        }

        reply.code(200).header('Content-Type', 'application/json').send({
          statusCode: result.statusCode,
          data: result.data,
        })
      }
    } catch (error: any) {
      return reply.code(500).header('Content-Type', 'application/json').send({
        statusCode: 500,
        message: error.message,
      })
    }
  })

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
      const totalMeals = await prisma.meal.count({
        where: {
          id_user: id,
        },
      })

      // Quantidade total de refeições dentro da dieta
      const totalMealsOnDiet = await prisma.meal.count({
        where: {
          AND: [
            {
              ondiet: {
                equals: true,
              },
            },
            {
              id_user: {
                equals: id,
              },
            },
          ],
        },
      })

      // Quantidade total de refeições fora da dieta
      const totalMealsOffDiet = await prisma.meal.count({
        where: {
          AND: [
            {
              ondiet: {
                equals: false,
              },
            },
            {
              id_user: {
                equals: id,
              },
            },
          ],
        },
      })

      const bestsequenceOndiet: [] = await prisma.$queryRaw`SELECT name
      FROM (
          SELECT name, COUNT(name) AS total
          FROM meal
          WHERE ondiet = TRUE
          AND id_user = ${id}
          GROUP BY name
      ) AS subquery
      ORDER BY total DESC
      LIMIT 1;`

      return reply
        .code(200)
        .header('Content-Type', 'application/json')
        .send({
          statusCode: 200,
          data: {
            totalmeals: totalMeals > 0 ? totalMeals : 0,
            totalmealsondiet: totalMealsOnDiet > 0 ? totalMealsOnDiet : 0,
            totalmealsoffdiet: totalMealsOffDiet > 0 ? totalMealsOffDiet : 0,
            bestsequenceOndiet:
              bestsequenceOndiet.length > 0 ? bestsequenceOndiet[0].name : '',
          },
        })
    }
  })
}
