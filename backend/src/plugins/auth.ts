import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { JWTPayload } from '../modules/auth/auth.types.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    optionalAuthenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Register JWT
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // Register Cookies
  await fastify.register(fastifyCookie, {
    secret: env.REFRESH_TOKEN_SECRET,
    parseOptions: {},
  });

  // Authentication Decorator (Guard)
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Missing or invalid authentication token',
        });
      }
    }
  );

  // Optional Authentication Decorator
  fastify.decorate(
    'optionalAuthenticate',
    async (request: FastifyRequest) => {
      try {
        await request.jwtVerify();
      } catch {
        // Token missing or invalid, continue as unauthenticated guest
      }
    }
  );
};

export default fp(authPlugin, {
  name: 'auth-plugin',
});
