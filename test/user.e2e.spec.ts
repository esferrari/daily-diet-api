import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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
        data: [
          {
            id: expect.any(String),
            name: 'User',
            email: 'user@gmail.com',
            created_at: expect.any(String),
          },
        ],
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

    const { id, email } = userCreated.body.data[0]

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
