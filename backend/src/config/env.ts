import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // Database
  DATABASE_URL: z
    .string()
    .default(
      'postgresql://fittrack:fittrack_secret@localhost:5432/fittrack_db?schema=public'
    ),
  POSTGRES_USER: z.string().default('fittrack'),
  POSTGRES_PASSWORD: z.string().default('fittrack_secret'),
  POSTGRES_DB: z.string().default('fittrack_db'),
  POSTGRES_PORT: z.coerce.number().default(5432),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Authentication & Security
  JWT_SECRET: z.string().default('dev-jwt-secret-fit-track-ai-must-change-in-production-min32'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().default('dev-refresh-secret-fit-track-ai-must-change-in-production-min32'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),

  // Gemini AI Coach / LLM Configuration
  GEMINI_API_KEY: z.string().optional(),
  LLM_PROVIDER: z.string().default('gemini'),
  LLM_MODEL: z.string().default('gemini-flash-lite-latest'),
  LLM_API_KEY: z.string().optional(),
  LLM_DAILY_CALL_BUDGET: z.coerce.number().default(20),

  // Cloudflare R2 Media Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('fittrack-media'),
  R2_PUBLIC_URL: z.string().optional(),

  // Observability & Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}
