import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/logger/index.js';
import { env } from '../../config/env.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('📦 PostgreSQL database connected successfully via Prisma');
  } catch (err) {
    logger.error({ err }, '❌ Database connection failed');
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
