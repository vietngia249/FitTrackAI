import { FastifyRequest, FastifyReply } from 'fastify';
import { ExercisesService } from './exercises.service.js';
import {
  ExerciseQuerySchema,
  CreateExerciseSchema,
  UpdateExerciseSchema,
  ExerciseParamsSchema,
} from './exercises.schemas.js';

const exercisesService = new ExercisesService();

export async function listExercisesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // If user is authenticated, we pass their userId; otherwise undefined
  const currentUserId = (request.user as { id?: string } | undefined)?.id;
  const parseResult = ExerciseQuerySchema.safeParse(request.query);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid query parameters',
      issues: parseResult.error.issues,
    });
  }

  try {
    const result = await exercisesService.listExercises(
      parseResult.data,
      currentUserId
    );
    return reply.status(200).send(result);
  } catch (err: any) {
    if (
      err?.code === 'P1001' ||
      err?.name === 'PrismaClientInitializationError'
    ) {
      return reply.status(200).send({
        items: [],
        total: 0,
        limit: parseResult.data.limit,
        offset: parseResult.data.offset,
        hasMore: false,
      });
    }
    throw err;
  }
}

export async function getExerciseByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const currentUserId = (request.user as { id?: string } | undefined)?.id;
  const paramResult = ExerciseParamsSchema.safeParse(request.params);

  if (!paramResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid exercise identifier',
    });
  }

  try {
    const exercise = await exercisesService.getExerciseById(
      paramResult.data.id,
      currentUserId
    );

    if (!exercise) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Exercise not found',
      });
    }

    return reply.status(200).send(exercise);
  } catch (err: any) {
    if (
      err?.code === 'P1001' ||
      err?.name === 'PrismaClientInitializationError'
    ) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Exercise not found',
      });
    }
    throw err;
  }
}

export async function createCustomExerciseHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = CreateExerciseSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const exercise = await exercisesService.createCustomExercise(
    parseResult.data,
    user.id
  );

  return reply.status(201).send(exercise);
}

export async function updateCustomExerciseHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const paramResult = ExerciseParamsSchema.safeParse(request.params);
  if (!paramResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid exercise identifier',
    });
  }

  const parseResult = UpdateExerciseSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  try {
    const updated = await exercisesService.updateCustomExercise(
      paramResult.data.id,
      parseResult.data,
      user.id
    );

    if (!updated) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Exercise not found',
      });
    }

    return reply.status(200).send(updated);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You are not authorized to edit this exercise',
      });
    }
    throw err;
  }
}

export async function deleteCustomExerciseHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const paramResult = ExerciseParamsSchema.safeParse(request.params);
  if (!paramResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid exercise identifier',
    });
  }

  try {
    const deleted = await exercisesService.deleteCustomExercise(
      paramResult.data.id,
      user.id
    );

    if (!deleted) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Exercise not found',
      });
    }

    return reply.status(200).send({ success: true, id: paramResult.data.id });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You are not authorized to delete this exercise',
      });
    }
    throw err;
  }
}
