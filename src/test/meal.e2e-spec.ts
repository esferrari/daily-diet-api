import { it, expect, beforeAll, afterAll, describe } from 'vitest'
import supertest from 'supertest'
import { app } from '../app'

let authToken: string
let idUser: string
describe('Meal routes', () => {
  beforeAll(async () => {
    await app.ready()

    const userCreated = await supertest(app.server).post('/user/create').send({
      username: 'User3',
      email: 'user3@gmail.com',
    })

    const { id, email } = userCreated.body.data

    const response = await supertest(app.server).post('/user/login').send({
      id,
      email,
    })

    authToken = response.body.data.token
    idUser = id
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new meal', async () => {
    const objMeal = {
      name: 'Salad',
      description: 'lettuce',
      ondiet: true,
      meal_at: '2020-01-01T01:01:01Z',
    }
    const response = await supertest(app.server)
      .post('/meal/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send(objMeal)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 201,
        data: {
          id: expect.any(Number),
          id_user: expect.any(String),
          name: 'Salad',
          description: 'lettuce',
          ondiet: true,
          meal_at: expect.any(String),
          created_at: expect.any(String),
        },
      }),
    )
  })

  it('should be able to alter a meal', async () => {
    const objMeal = {
      name: 'Salad',
      description: 'lettuce',
      ondiet: true,
      meal_at: '2020-01-01T01:01:01Z',
    }
    await supertest(app.server)
      .post('/meal/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send(objMeal)

    const response = await supertest(app.server)
      .put('/meal/alter')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        id: 1,
        name: 'Alter name',
        description: 'Alter description',
      })

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 200,
        data: {
          id: 1,
          id_user: expect.any(String),
          name: 'Alter name',
          description: 'Alter description',
          ondiet: true,
          meal_at: expect.any(String),
          created_at: expect.any(String),
        },
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const objMeal = {
      name: 'Salad',
      description: 'lettuce',
      ondiet: true,
      meal_at: '2020-01-01T01:01:01Z',
    }
    await supertest(app.server)
      .post('/meal/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send(objMeal)

    const response = await supertest(app.server)
      .delete('/meal/delete/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 200,
        message: 'Deleted 1 records',
      }),
    )
  })

  it('should be able to get a metric about user', async () => {
    await supertest(app.server)
      .post('/meal/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Salad',
        description: 'lettuce',
        ondiet: true,
        meal_at: '2020-01-01T01:01:01Z',
      })

    await supertest(app.server)
      .post('/meal/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Junk Food',
        description: 'Hamburger',
        ondiet: false,
        meal_at: '2020-02-02T02:02:02Z',
      })

    const response = await supertest(app.server)
      .get(`/meal/metric/${idUser}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 200,
        data: {
          totalmeals: 4,
          totalmealsondiet: 3,
          totalmealsoffdiet: 1,
          bestsequenceOndiet: 'Salad',
        },
      }),
    )
  })
})
