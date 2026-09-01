import { FastifyRequest, FastifyReply } from 'fastify';
import { BodyService } from './body.service.js';
import {
  LogWeightSchema,
  LogMeasurementSchema,
  LogPhotoSchema,
  BodyParamSchema,
} from './body.schemas.js';

const bodyService = new BodyService();

export async function logWeightHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = LogWeightSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const log = await bodyService.logWeight(user.id, parseResult.data);
  return reply.status(201).send(log);
}

export async function getWeightHistoryHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const history = await bodyService.getWeightHistory(user.id);
  return reply.send(history);
}

export async function deleteWeightHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const paramResult = BodyParamSchema.safeParse(request.params);

  if (!paramResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid weight log ID',
    });
  }

  const deleted = await bodyService.deleteWeight(user.id, paramResult.data.id);
  if (!deleted) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Weight log not found or unauthorized',
    });
  }

  return reply.status(204).send();
}

export async function logMeasurementHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = LogMeasurementSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const measurement = await bodyService.logMeasurement(user.id, parseResult.data);
  return reply.status(201).send(measurement);
}

export async function getMeasurementHistoryHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const history = await bodyService.getMeasurementHistory(user.id);
  return reply.send(history);
}

export async function logPhotoHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const parseResult = LogPhotoSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const photo = await bodyService.logPhoto(user.id, parseResult.data);
  return reply.status(201).send(photo);
}

export async function getPhotosHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const query = request.query as { photoType?: string };
  const photos = await bodyService.getPhotos(user.id, query.photoType);
  return reply.send(photos);
}

export async function deletePhotoHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const paramResult = BodyParamSchema.safeParse(request.params);

  if (!paramResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid photo ID',
    });
  }

  const deleted = await bodyService.deletePhoto(user.id, paramResult.data.id);
  if (!deleted) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Photo not found or unauthorized',
    });
  }

  return reply.status(204).send();
}
