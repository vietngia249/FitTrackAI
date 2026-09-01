import { FastifyPluginAsync } from 'fastify';
import {
  logWeightHandler,
  getWeightHistoryHandler,
  deleteWeightHandler,
  logMeasurementHandler,
  getMeasurementHistoryHandler,
  logPhotoHandler,
  getPhotosHandler,
  deletePhotoHandler,
} from './body.controller.js';

export const bodyRoutes: FastifyPluginAsync = async (fastify) => {
  // All body tracking endpoints require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // Body Weight & 7-Day Moving Average
  fastify.post('/weight', logWeightHandler);
  fastify.get('/weight', getWeightHistoryHandler);
  fastify.delete('/weight/:id', deleteWeightHandler);

  // Circumference Tape Measurements
  fastify.post('/measurements', logMeasurementHandler);
  fastify.get('/measurements', getMeasurementHistoryHandler);

  // Private Progress Photos
  fastify.post('/photos', logPhotoHandler);
  fastify.get('/photos', getPhotosHandler);
  fastify.delete('/photos/:id', deletePhotoHandler);
};
