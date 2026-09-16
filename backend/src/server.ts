import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './shared/logger/index.js';

async function startServer() {
  const app = buildApp();

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`🚀 FitTrack AI Server listening on ${address}`);
    logger.info(`👉 Health check endpoint: ${address}/health`);
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

// FitTrack AI Server entry point
startServer();
