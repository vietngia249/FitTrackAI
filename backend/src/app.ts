import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { logger } from './shared/logger/index.js';
import { env } from './config/env.js';
import zodValidatorPlugin from './plugins/zod-validator.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    loggerInstance: logger,
  });

  // Core Security & Utility Plugins
  app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  });

  app.register(cors, {
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.register(sensible);
  app.register(zodValidatorPlugin);
  app.register(authPlugin);

  // Register Modules
  app.register(healthRoutes);
  app.register(authRoutes);

  // Root fallback route
  app.get('/', async () => {
    return {
      name: 'FitTrack AI API',
      version: '1.0.0',
      status: 'active',
      documentation: '/docs',
    };
  });

  return app;
}
