import fastify from 'fastify'
import { userRoutes } from './routes/user'
import { mealRoutes } from './routes/meal'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

export const app = fastify()

app.register(userRoutes, {
  prefix: 'user',
})
app.register(mealRoutes, {
  prefix: 'meal',
})

app.register(fastifySwagger, {
  mode: 'static',
  specification: {
    path: './swagger.yaml',
    postProcessor: function (swaggerObject) {
      return swaggerObject
    },
    baseDir: '/path/to/external/spec/files/location',
  },
})

app.register(fastifySwaggerUi, {
  baseDir: '/path/to/external/spec/files/location',
  routePrefix: '/docs',
  initOAuth: {},
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next()
    },
    preHandler: function (request, reply, next) {
      next()
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
})
