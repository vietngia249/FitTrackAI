import { FastifyPluginAsync } from 'fastify';
import {
  copilotChatHandler,
  getCopilotRecommendationsHandler,
} from './copilot.controller.js';

export const copilotRoutes: FastifyPluginAsync = async (fastify) => {
  // Chat supports both authenticated users and guests
  fastify.post(
    '/chat',
    { preHandler: [fastify.optionalAuthenticate] },
    copilotChatHandler
  );

  // Personalized progressive overload recommendations require login
  fastify.get(
    '/recommendations',
    { preHandler: [fastify.authenticate] },
    getCopilotRecommendationsHandler
  );
};
