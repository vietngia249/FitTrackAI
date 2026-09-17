import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { logger } from '../../shared/logger/index.js';
import { env } from '../../config/env.js';

neonConfig.webSocketConstructor = ws;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var neonPool: Pool | undefined;
}

function createPrismaClient(): PrismaClient {
  const isNeon = env.DATABASE_URL.includes('neon.tech');

  if (isNeon) {
    const pool = global.neonPool || new Pool({ connectionString: env.DATABASE_URL });
    if (env.NODE_ENV !== 'production') {
      global.neonPool = pool;
    }
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({
      adapter,
      log:
        env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });
}

export const prisma = global.prisma || createPrismaClient();

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
  if (global.neonPool) {
    await global.neonPool.end();
  }
}
