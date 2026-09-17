import { FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsService } from './analytics.service.js';

const analyticsService = new AnalyticsService();

export async function getOverviewHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };

  try {
    const data = await analyticsService.getOverview(user.id);
    return reply.status(200).send(data);
  } catch (err: any) {
    if (err?.code === 'P1001' || err?.name === 'PrismaClientInitializationError') {
      return reply.status(200).send({
        weeklyVolumeKg: 0,
        monthlyVolumeKg: 0,
        totalCompletedSessions: 0,
        streakDays: 0,
        muscleDistribution: [],
        lastUpdated: new Date().toISOString(),
      });
    }
    throw err;
  }
}

export async function getExerciseAnalyticsHandler(
  request: FastifyRequest<{ Params: { exerciseId: string } }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const { exerciseId } = request.params;

  if (!exerciseId) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Exercise ID is required',
    });
  }

  try {
    const data = await analyticsService.getExerciseAnalytics(user.id, exerciseId);
    return reply.status(200).send(data);
  } catch (err: any) {
    if (err?.code === 'P1001' || err?.name === 'PrismaClientInitializationError') {
      return reply.status(200).send({
        exerciseId,
        progression: [],
        prs: {
          maxWeightKg: 0,
          maxEstimated1RM: 0,
          maxSetVolumeKg: 0,
          bestRepsAtMaxWeight: 0,
        },
        totalSessions: 0,
      });
    }
    throw err;
  }
}

export async function getPersonalRecordsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };

  try {
    const data = await analyticsService.getPersonalRecords(user.id);
    return reply.status(200).send(data);
  } catch (err: any) {
    if (err?.code === 'P1001' || err?.name === 'PrismaClientInitializationError') {
      return reply.status(200).send([]);
    }
    throw err;
  }
}

