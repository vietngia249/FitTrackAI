import { FastifyRequest, FastifyReply } from 'fastify';
import { NutritionService } from './nutrition.service.js';
import {
  SearchFoodsQuerySchema,
  CreateFoodSchema,
  CreateMealSchema,
  GetMealsQuerySchema,
  UpdateNutritionGoalSchema,
  NutritionParamSchema,
} from './nutrition.schemas.js';

const nutritionService = new NutritionService();

export async function searchFoodsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = SearchFoodsQuerySchema.safeParse(request.query);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const result = await nutritionService.searchFoods(user.id, parseResult.data);
  return reply.send(result);
}

export async function createCustomFoodHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = CreateFoodSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const food = await nutritionService.createCustomFood(user.id, parseResult.data);
  return reply.status(201).send(food);
}

export async function logMealHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = CreateMealSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const meal = await nutritionService.logMeal(user.id, parseResult.data);
  return reply.status(201).send(meal);
}

export async function getMealsByDateHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = GetMealsQuerySchema.safeParse(request.query);

  const dateStr = parseResult.success ? parseResult.data.date : undefined;
  const result = await nutritionService.getMealsByDate(user.id, dateStr);
  return reply.send(result);
}

export async function deleteMealHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const paramResult = NutritionParamSchema.safeParse(request.params);

  if (!paramResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid meal ID',
    });
  }

  const deleted = await nutritionService.deleteMeal(user.id, paramResult.data.id);
  if (!deleted) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Meal not found or unauthorized',
    });
  }

  return reply.status(204).send();
}

export async function deleteMealItemHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const paramResult = NutritionParamSchema.safeParse(request.params);

  if (!paramResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid item ID',
    });
  }

  const deleted = await nutritionService.deleteMealItem(user.id, paramResult.data.id);
  if (!deleted) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Item not found or unauthorized',
    });
  }

  return reply.status(204).send();
}

export async function getDailyGoalsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const goals = await nutritionService.getDailyGoals(user.id);
  return reply.send(goals);
}

export async function updateDailyGoalsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = UpdateNutritionGoalSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const updated = await nutritionService.updateDailyGoals(user.id, parseResult.data);
  return reply.send(updated);
}
