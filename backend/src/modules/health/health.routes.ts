import { FastifyInstance } from 'fastify';
import { getHealthStatus } from './health.controller.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', getHealthStatus);
  fastify.get('/api/v1/health', getHealthStatus);
}
