import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { ZodSchema, ZodError } from 'zod';

const zodValidatorPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setValidatorCompiler(({ schema }) => {
    return (data) => {
      if (schema && typeof (schema as ZodSchema).safeParse === 'function') {
        const result = (schema as ZodSchema).safeParse(data);
        if (!result.success) {
          return { error: result.error as unknown as Error };
        }
        return { value: result.data };
      }
      return { value: data };
    };
  });

  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const err = error as any;
    if (err && typeof err.statusCode === 'number') {
      return reply.status(err.statusCode).send({
        statusCode: err.statusCode,
        error: err.name || 'Error',
        message: err.message || 'An error occurred',
      });
    }

    if (
      err?.name === 'PrismaClientInitializationError' ||
      err?.code === 'P1001' ||
      err?.message?.includes("Can't reach database server")
    ) {
      request.log.error(error);
      return reply.status(503).send({
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'Database service is currently unreachable. Please try again shortly.',
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected internal server error occurred',
    });
  });
};

export default fp(zodValidatorPlugin, {
  name: 'zod-validator',
});
