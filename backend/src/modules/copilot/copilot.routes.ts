import { FastifyPluginAsync } from 'fastify';
import {
  copilotChatHandler,
  getCopilotRecommendationsHandler,
} from './copilot.controller.js';

export const copilotRoutes: FastifyPluginAsync = async (fastify) => {
  // All AI Copilot endpoints require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post('/chat', copilotChatHandler);
  fastify.get('/recommendations', getCopilotRecommendationsHandler);
};
