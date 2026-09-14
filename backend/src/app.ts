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
import { exerciseRoutes } from './modules/exercises/exercises.routes.js';
import { workoutRoutes } from './modules/workouts/workouts.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { nutritionRoutes } from './modules/nutrition/nutrition.routes.js';
import { bodyRoutes } from './modules/body/body.routes.js';
import { copilotRoutes } from './modules/copilot/copilot.routes.js';

export function buildApp() {
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
  app.register(exerciseRoutes, { prefix: '/api/v1/exercises' });
  app.register(workoutRoutes, { prefix: '/api/v1/workouts' });
  app.register(analyticsRoutes, { prefix: '/api/v1/analytics' });
  app.register(nutritionRoutes, { prefix: '/api/v1/nutrition' });
  app.register(bodyRoutes, { prefix: '/api/v1/body' });
  app.register(copilotRoutes, { prefix: '/api/v1/gemini' });
  app.register(copilotRoutes, { prefix: '/api/v1/copilot' });

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
