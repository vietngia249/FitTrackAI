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

    if ('statusCode' in error && error.statusCode) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name || 'Error',
        message: error.message,
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
