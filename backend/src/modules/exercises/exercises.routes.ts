import { FastifyPluginAsync } from 'fastify';
import {
  listExercisesHandler,
  getExerciseByIdHandler,
  createCustomExerciseHandler,
  updateCustomExerciseHandler,
  deleteCustomExerciseHandler,
} from './exercises.controller.js';

export const exerciseRoutes: FastifyPluginAsync = async (fastify) => {
  // Public/Search endpoints (with optional user context)
  fastify.get('/', {
    preHandler: fastify.optionalAuthenticate,
    handler: listExercisesHandler,
  });

  fastify.get('/:id', {
    preHandler: fastify.optionalAuthenticate,
    handler: getExerciseByIdHandler,
  });

  // User-scoped custom exercises endpoints (require authentication)
  fastify.post('/', {
    preHandler: fastify.authenticate,
    handler: createCustomExerciseHandler,
  });

  fastify.patch('/:id', {
    preHandler: fastify.authenticate,
    handler: updateCustomExerciseHandler,
  });

  fastify.delete('/:id', {
    preHandler: fastify.authenticate,
    handler: deleteCustomExerciseHandler,
  });
};
