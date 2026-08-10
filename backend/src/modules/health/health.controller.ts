import { FastifyReply, FastifyRequest } from 'fastify';

export async function getHealthStatus(request: FastifyRequest, reply: FastifyReply) {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    service: 'fittrack-backend',
  };

  return reply.status(200).send(healthData);
}
