import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';
import { loginSchema, registerSchema, googleAuthSchema } from './auth.schemas.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Public Auth Routes
  fastify.post(
    '/api/v1/auth/register',
    {
      schema: {
        body: registerSchema,
      },
    },
    authController.register.bind(authController)
  );

  fastify.post(
    '/api/v1/auth/login',
    {
      schema: {
        body: loginSchema,
      },
    },
    authController.login.bind(authController)
  );

  fastify.post(
    '/api/v1/auth/google',
    {
      schema: {
        body: googleAuthSchema,
      },
    },
    authController.googleAuth.bind(authController)
  );

  fastify.post(
    '/api/v1/auth/refresh',
    authController.refresh.bind(authController)
  );

  fastify.post(
    '/api/v1/auth/logout',
    authController.logout.bind(authController)
  );

  // Protected Auth Route
  fastify.get(
    '/api/v1/auth/me',
    {
      preHandler: [fastify.authenticate],
    },
    authController.getMe.bind(authController)
  );
}
