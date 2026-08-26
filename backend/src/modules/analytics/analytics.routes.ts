import { FastifyPluginAsync } from 'fastify';
import {
  getOverviewHandler,
  getExerciseAnalyticsHandler,
  getPersonalRecordsHandler,
} from './analytics.controller.js';

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/overview', getOverviewHandler);
  fastify.get('/exercises/:exerciseId', getExerciseAnalyticsHandler);
  fastify.get('/records', getPersonalRecordsHandler);
};
