import { FastifyPluginAsync } from 'fastify';
import {
  searchFoodsHandler,
  createCustomFoodHandler,
  getMealsByDateHandler,
  logMealHandler,
  deleteMealHandler,
  deleteMealItemHandler,
  getDailyGoalsHandler,
  updateDailyGoalsHandler,
} from './nutrition.controller.js';

export const nutritionRoutes: FastifyPluginAsync = async (fastify) => {
  // All nutrition actions require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // Food items search & custom food
  fastify.get('/foods', searchFoodsHandler);
  fastify.post('/foods', createCustomFoodHandler);

  // Meals & Daily Food Diary
  fastify.get('/meals', getMealsByDateHandler);
  fastify.post('/meals', logMealHandler);
  fastify.delete('/meals/:id', deleteMealHandler);
  fastify.delete('/meals/items/:id', deleteMealItemHandler);

  // Daily Nutrition Goals
  fastify.get('/goals', getDailyGoalsHandler);
  fastify.put('/goals', updateDailyGoalsHandler);
};
