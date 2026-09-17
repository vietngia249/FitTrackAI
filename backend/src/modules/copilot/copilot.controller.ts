import { FastifyRequest, FastifyReply } from 'fastify';
import { CopilotService } from './copilot.service.js';
import { CopilotChatSchema } from './copilot.schemas.js';

const copilotService = new CopilotService();

export async function copilotChatHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id?: string } | undefined;
  const userId = user?.id || `guest-${(request.ip || 'local').replace(/[^a-zA-Z0-9]/g, '_')}`;
  const parseResult = CopilotChatSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: parseResult.error.issues,
    });
  }

  const result = await copilotService.chat(
    userId,
    parseResult.data.message,
    parseResult.data.history
  );
  return reply.send(result);
}

export async function getCopilotRecommendationsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string };
  const recommendations = await copilotService.getRecommendations(user.id);
  return reply.send(recommendations);
}
