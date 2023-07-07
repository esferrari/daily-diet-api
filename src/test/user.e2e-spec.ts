import { it, expect, beforeAll, afterAll, describe } from 'vitest'
import supertest from 'supertest'
import { app } from '../app'
import 'dotenv/config'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new user', async () => {
    const objUser = {
      username: 'User',
      email: 'user@gmail.com',
    }

    const response = await supertest(app.server)
      .post('/user/create')
      .send(objUser)

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 201,
        data: {
          id: expect.any(String),
          username: 'User',
          email: 'user@gmail.com',
          created_at: expect.any(String),
        },
      }),
    )
  })

  it('should be able to login', async () => {
    const objUser = {
      username: 'User2',
      email: 'user2@gmail.com',
    }

    const userCreated = await supertest(app.server)
      .post('/user/create')
      .send(objUser)

    const { id, email } = userCreated.body.data

    const response = await supertest(app.server).post('/user/login').send({
      id,
      email,
    })

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 200,
        data: {
          token: expect.any(String),
        },
      }),
    )
  })
})
