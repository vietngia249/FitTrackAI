import { FastifyPluginAsync } from 'fastify';
import {
  createPlanHandler,
  listPlansHandler,
  getPlanByIdHandler,
  deletePlanHandler,
  startSessionHandler,
  getSessionByIdHandler,
  logSetHandler,
  completeSessionHandler,
  listSessionsHandler,
} from './workouts.controller.js';

export const workoutRoutes: FastifyPluginAsync = async (fastify) => {
  // All workout plans & sessions require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // Plans (Routines / Templates)
  fastify.post('/plans', createPlanHandler);
  fastify.get('/plans', listPlansHandler);
  fastify.get('/plans/:id', getPlanByIdHandler);
  fastify.delete('/plans/:id', deletePlanHandler);

  // Sessions (Live & Logged workouts)
  fastify.post('/sessions', startSessionHandler);
  fastify.get('/sessions', listSessionsHandler);
  fastify.get('/sessions/:id', getSessionByIdHandler);
  fastify.post('/sessions/:id/sets', logSetHandler);
  fastify.post('/sessions/:id/complete', completeSessionHandler);
};
